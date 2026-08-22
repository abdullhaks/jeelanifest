import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async findAll(query: PaginationQuery): Promise<PaginatedResult<any>> {
    const filters: any = {};

    // Map custom filters from the query to Mongoose query
    if (query.filter) {
      try {
        const parsedFilters = JSON.parse(query.filter);
        if (parsedFilters.type) filters.type = parsedFilters.type;
        if (parsedFilters.status) filters.status = parsedFilters.status;
        if (parsedFilters.stage) filters.stage = parsedFilters.stage;
        if (parsedFilters.category) {
          const cat = Array.isArray(parsedFilters.category) ? parsedFilters.category[0] : parsedFilters.category;
          if (cat === 'group') {
            filters.type = 'group';
          } else if (cat) {
            filters.category = cat;
          }
        }
        if (parsedFilters.date) {
          const dateVal = Array.isArray(parsedFilters.date) ? parsedFilters.date[0] : parsedFilters.date;
          if (dateVal) {
            filters.date = { $regex: new RegExp(dateVal, 'i') };
          }
        }
        if (parsedFilters.time) {
          const timeVal = Array.isArray(parsedFilters.time) ? parsedFilters.time[0] : parsedFilters.time;
          if (timeVal) {
            filters.time = { $regex: new RegExp(timeVal, 'i') };
          }
        }
      } catch (e) {
        // invalid JSON filter, ignore
      }
    }

    const result = await paginate<CompetitionDocument>(
      this.competitionModel,
      query,
      ['name', 'date', 'time'], // searchable fields
      filters
    );

    const compIds = result.data.map((c) => c._id);
    const studentCounts = await this.studentModel.aggregate([
      { $match: { 'programs.competition': { $in: compIds } } },
      { $unwind: '$programs' },
      { $match: { 'programs.competition': { $in: compIds } } },
      { $group: { _id: '$programs.competition', count: { $sum: 1 } } }
    ]);

    const countMap = new Map<string, number>();
    studentCounts.forEach((sc) => countMap.set(sc._id.toString(), sc.count));

    const enrichedData = result.data.map((comp) => {
      const compObj = comp.toObject ? comp.toObject() : comp;
      const entriesCount =
        comp.type === 'group'
          ? comp.groupEntries?.length || 0
          : countMap.get(comp._id.toString()) || 0;
      return {
        ...compObj,
        entriesCount,
      };
    });

    return {
      ...result,
      data: enrichedData as any,
    };
  }

  async findOne(id: string): Promise<any> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    const compObj = competition.toObject();
    let entriesCount = 0;
    if (competition.type === 'group') {
      entriesCount = competition.groupEntries?.length || 0;
    } else {
      entriesCount = await this.studentModel.countDocuments({
        'programs.competition': id,
      });
    }
    return {
      ...compObj,
      entriesCount,
    };
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
    const compObjectId = new Types.ObjectId(id);
    await this.studentModel.updateMany(
      { 'programs.competition': { $in: [compObjectId, id] } },
      { $pull: { programs: { competition: { $in: [compObjectId, id] } } } } as any
    ).exec();

    // Delete the competition document
    await this.competitionModel.findByIdAndDelete(id).exec();

    // Emit real-time events
    this.socketGateway.emitEvent('competitions:updated', { _id: id });
    this.socketGateway.emitEvent('program:status-changed', { _id: id, status: 'deleted' });
    this.socketGateway.emitEvent('points:updated', { timestamp: new Date() });
  }
}
