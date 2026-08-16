import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Student, StudentSchema } from '../students/student.schema';
import { Group, GroupSchema } from '../groups/group.schema';
import { Competition, CompetitionSchema } from '../competitions/competition.schema';
import { Result, ResultSchema } from '../results/result.schema';
import { AuthModule } from '../auth/auth.module'; // for AuthGuard

import { VisitorsModule } from '../visitors/visitors.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Competition.name, schema: CompetitionSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
    AuthModule,
    VisitorsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
