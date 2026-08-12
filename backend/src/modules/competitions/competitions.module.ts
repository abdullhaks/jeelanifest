import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompetitionsController } from './competitions.controller';
import { CompetitionsService } from './competitions.service';
import { Competition, CompetitionSchema } from './competition.schema';
import { Result, ResultSchema } from '../results/result.schema';
import { Group, GroupSchema } from '../groups/group.schema';
import { Student, StudentSchema } from '../students/student.schema';
import { AuthModule } from '../auth/auth.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Competition.name, schema: CompetitionSchema },
      { name: Result.name, schema: ResultSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    AuthModule,
    SocketModule
  ],
  controllers: [CompetitionsController],
  providers: [CompetitionsService],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
