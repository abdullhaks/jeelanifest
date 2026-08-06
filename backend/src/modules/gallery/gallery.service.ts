import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GalleryImage, GalleryImageDocument } from './gallery.schema';
import { CreateGalleryImageDto, UpdateGalleryImageDto } from './gallery.schemas';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(GalleryImage.name) private galleryModel: Model<GalleryImageDocument>,
  ) {}

  async create(createDto: CreateGalleryImageDto): Promise<GalleryImage> {
    const created = new this.galleryModel(createDto);
    return created.save();
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<GalleryImage>> {
    let filters: Record<string, any> = {};
    if (query.filter) {
      try {
        filters = JSON.parse(query.filter);
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    return paginate<GalleryImageDocument>(
      this.galleryModel,
      query,
      ['description'],
      filters,
      {}
    );
  }

  async findOne(id: string): Promise<GalleryImage> {
    const item = await this.galleryModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Gallery image with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateGalleryImageDto): Promise<GalleryImage> {
    const updated = await this.galleryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
      
    if (!updated) {
      throw new NotFoundException(`Gallery image with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.galleryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Gallery image with ID ${id} not found`);
    }
  }
}
