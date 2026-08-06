import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Poster, PosterDocument } from './poster.schema';
import { CreatePosterDto, UpdatePosterDto } from './posters.schemas';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';

@Injectable()
export class PostersService {
  constructor(
    @InjectModel(Poster.name) private posterModel: Model<PosterDocument>,
  ) {}

  async create(createDto: CreatePosterDto): Promise<Poster> {
    const created = new this.posterModel(createDto);
    return created.save();
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<Poster>> {
    let filters: Record<string, any> = {};
    if (query.filter) {
      try {
        filters = JSON.parse(query.filter);
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    return paginate<PosterDocument>(
      this.posterModel,
      query,
      ['title', 'description'], // searchable fields
      filters,
      { populate: ['competition'] }
    );
  }

  async findOne(id: string): Promise<Poster> {
    const poster = await this.posterModel
      .findById(id)
      .populate('competition')
      .exec();
      
    if (!poster) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }
    return poster;
  }

  async update(id: string, updateDto: UpdatePosterDto): Promise<Poster> {
    const updated = await this.posterModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
      
    if (!updated) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.posterModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }
  }
}
