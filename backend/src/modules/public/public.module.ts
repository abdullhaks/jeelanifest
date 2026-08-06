import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { Group, GroupSchema } from '../groups/group.schema';
import { Student, StudentSchema } from '../students/student.schema';
import { Competition, CompetitionSchema } from '../competitions/competition.schema';
import { Result, ResultSchema } from '../results/result.schema';
import { GalleryImage, GalleryImageSchema } from '../gallery/gallery.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Competition.name, schema: CompetitionSchema },
      { name: Result.name, schema: ResultSchema },
      { name: GalleryImage.name, schema: GalleryImageSchema }
    ])
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
