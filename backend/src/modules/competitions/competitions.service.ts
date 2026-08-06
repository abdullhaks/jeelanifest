import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Competition, CompetitionDocument } from './competition.schema';
import { CreateCompetitionDto, UpdateCompetitionDto } from './competitions.schemas';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';

import { RealtimeGateway } from '../socket/realtime.gateway';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectModel(Competition.name) private competitionModel: Model<CompetitionDocument>,
    private socketGateway: RealtimeGateway,
  ) {}

  async create(createDto: CreateCompetitionDto): Promise<Competition | Competition[]> {
    const baseData = {
      name: createDto.name,
      type: createDto.type,
      date: createDto.date,
      time: createDto.time,
      stage: null,
      status: 'upcoming',
    };
    
    if (createDto.type === 'individual' && createDto.categories && createDto.categories.length > 0) {
      const competitionsToCreate = createDto.categories.map(category => ({
        ...baseData,
        category,
      }));
      return (await this.competitionModel.insertMany(competitionsToCreate)) as any;
    } else {
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
    const result = await this.competitionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
  }
}
