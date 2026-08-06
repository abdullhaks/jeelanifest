import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { Result, ResultSchema } from './result.schema';
import { FinalResult, FinalResultSchema } from './final-result.schema';
import { Student, StudentSchema } from '../students/student.schema';
import { Group, GroupSchema } from '../groups/group.schema';
import { Competition, CompetitionSchema } from '../competitions/competition.schema';
import { AuthModule } from '../auth/auth.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: FinalResult.name, schema: FinalResultSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Competition.name, schema: CompetitionSchema }
    ]),
    AuthModule,
    SocketModule
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}
