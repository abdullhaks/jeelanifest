import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitorCount, VisitorCountSchema } from './visitor.schema';
import { VisitorsService } from './visitors.service';
import { VisitorsController } from './visitors.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VisitorCount.name, schema: VisitorCountSchema },
    ]),
  ],
  controllers: [VisitorsController],
  providers: [VisitorsService],
  exports: [VisitorsService, MongooseModule],
})
export class VisitorsModule {}
