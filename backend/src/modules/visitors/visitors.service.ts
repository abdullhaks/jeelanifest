import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VisitorCount, VisitorCountDocument } from './visitor.schema';

@Injectable()
export class VisitorsService {
  constructor(
    @InjectModel(VisitorCount.name)
    private visitorCountModel: Model<VisitorCountDocument>,
  ) {}

  async recordHit(): Promise<{ totalVisitors: number }> {
    const record = await this.visitorCountModel
      .findOneAndUpdate(
        { key: 'site_visitors' },
        { $inc: { count: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    return { totalVisitors: record?.count || 0 };
  }

  async getCount(): Promise<number> {
    const record = await this.visitorCountModel
      .findOne({ key: 'site_visitors' })
      .exec();

    return record ? record.count : 0;
  }
}
