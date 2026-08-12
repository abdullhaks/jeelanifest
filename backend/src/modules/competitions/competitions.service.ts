import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Competition, CompetitionDocument } from './competition.schema';
import { Result, ResultDocument } from '../results/result.schema';
import { Group, GroupDocument } from '../groups/group.schema';
import { Student, StudentDocument } from '../students/student.schema';
import { CreateCompetitionDto, UpdateCompetitionDto } from './competitions.schemas';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';

import { RealtimeGateway } from '../socket/realtime.gateway';

@Injectable()
export class CompetitionsService implements OnModuleInit {
  constructor(
    @InjectModel(Competition.name) private competitionModel: Model<CompetitionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private socketGateway: RealtimeGateway,
  ) {}

  async onModuleInit() {
    try {
      const comps = await this.competitionModel.find().exec();
      for (const comp of comps) {
        if (comp.name && comp.name !== comp.name.trim().toUpperCase()) {
          comp.name = comp.name.trim().toUpperCase();
          await comp.save();
        }
      }
    } catch (e) {
      console.error('Migration error for competition names:', e);
    }
  }

  async create(createDto: CreateCompetitionDto): Promise<Competition | Competition[]> {
    const nameUpper = createDto.name.trim().toUpperCase();
    const escapedName = nameUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const baseData = {
      name: nameUpper,
      type: createDto.type,
      date: createDto.date,
      time: createDto.time,
      stage: null,
      status: 'upcoming',
    };
    
    if (createDto.type === 'individual' && createDto.categories && createDto.categories.length > 0) {
      for (const category of createDto.categories) {
        const existing = await this.competitionModel.findOne({
          name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
          category: category
        }).exec();
        if (existing) {
          throw new BadRequestException(`Competition with name "${nameUpper}" already exists for category "${category.toUpperCase()}"`);
        }
      }

      const competitionsToCreate = createDto.categories.map(category => ({
        ...baseData,
        category,
      }));
      return (await this.competitionModel.insertMany(competitionsToCreate)) as any;
    } else {
      const existing = await this.competitionModel.findOne({
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
        category: null
      }).exec();
      if (existing) {
        throw new BadRequestException(`Competition with name "${nameUpper}" already exists`);
      }

      const data = { ...baseData, category: null };
      const created = new this.competitionModel(data);
      return created.save();
    }
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<Competition>> {
    const filters: any = {};

    // Map custom filters from the query to Mongoose query
    if (query.filter) {
      try {
        const parsedFilters = JSON.parse(query.filter);
        if (parsedFilters.type) filters.type = parsedFilters.type;
        if (parsedFilters.status) filters.status = parsedFilters.status;
        if (parsedFilters.stage) filters.stage = parsedFilters.stage;
        if (parsedFilters.category) filters.category = parsedFilters.category;
      } catch (e) {
        // invalid JSON filter, ignore
      }
    }

    return paginate<CompetitionDocument>(
      this.competitionModel,
      query,
      ['name'], // searchable fields
      filters
    );
  }

  async findOne(id: string): Promise<Competition> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    return competition;
  }

  async update(id: string, updateDto: UpdateCompetitionDto): Promise<Competition> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (updateDto.name) {
      const nameUpper = updateDto.name.trim().toUpperCase();
      updateDto.name = nameUpper;
      const escapedName = nameUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const targetCategory = updateDto.category !== undefined ? updateDto.category : competition.category;

      const existing = await this.competitionModel.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
        category: targetCategory
      }).exec();
      if (existing) {
        throw new BadRequestException(`Competition with name "${nameUpper}" already exists`);
      }
    }

    if (updateDto.type === 'group' || (competition.type === 'group' && !updateDto.type)) {
       updateDto.category = null;
    }

    const updated = await this.competitionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
      
    if (!updated) {
       throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    
    this.socketGateway.emitEvent('competitions:updated', updated);
    this.socketGateway.emitEvent('program:status-changed', updated);
    
    return updated;
  }

  async updateStatus(id: string, status: string): Promise<Competition> {
    const updated = await this.competitionModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
      
    if (!updated) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    this.socketGateway.emitEvent('competitions:updated', updated);
    this.socketGateway.emitEvent('program:status-changed', updated);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const comp = await this.competitionModel.findById(id).exec();
    if (!comp) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    // Check if there is any result regarding this competition
    const resultDoc = await this.resultModel.findOne({ competition: id }).exec();
    if (resultDoc) {
      if (resultDoc.status === 'published' && resultDoc.winners && resultDoc.winners.length > 0) {
        for (const winner of resultDoc.winners) {
          const pType = (winner.participantType || '').toLowerCase();
          const points = winner.pointsAwarded || 0;

          if (pType === 'group') {
            const group = await this.groupModel.findById(winner.participant).exec();
            if (group) {
              group.totalPoints = Math.max(0, group.totalPoints - points);
              await group.save();
            }
          } else if (pType === 'student') {
            const student = await this.studentModel.findById(winner.participant).exec();
            if (student) {
              student.points = Math.max(0, student.points - points);
              if (student.programs) {
                student.programs = student.programs.filter(
                  p => p.competition && p.competition.toString() !== id
                );
              }
              await student.save();

              if (student.group) {
                const group = await this.groupModel.findById(student.group).exec();
                if (group) {
                  group.totalPoints = Math.max(0, group.totalPoints - points);
                  await group.save();
                }
              }
            }
          }
        }
      }

      // Delete the result document
      await this.resultModel.deleteOne({ _id: resultDoc._id }).exec();
    }

    // Remove competition reference from any students registered for it
    await this.studentModel.updateMany(
      { 'programs.competition': id },
      { $pull: { programs: { competition: id } } }
    ).exec();

    // Delete the competition document
    await this.competitionModel.findByIdAndDelete(id).exec();

    // Emit real-time events
    this.socketGateway.emitEvent('competitions:updated', { _id: id });
    this.socketGateway.emitEvent('program:status-changed', { _id: id, status: 'deleted' });
    this.socketGateway.emitEvent('points:updated', { timestamp: new Date() });
  }
}
