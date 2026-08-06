import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../students/student.schema';
import { Group, GroupDocument } from '../groups/group.schema';
import { Competition, CompetitionDocument } from '../competitions/competition.schema';
import { Result, ResultDocument } from '../results/result.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Competition.name) private competitionModel: Model<CompetitionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {}

  async getStats() {
    const totalStudents = await this.studentModel.countDocuments();
    const totalGroups = await this.groupModel.countDocuments({ isDeleted: false });
    const totalCompetitions = await this.competitionModel.countDocuments();
    const resultsPublished = await this.resultModel.countDocuments({ status: 'published' });

    // For Group Point Race
    const groups = await this.groupModel.find({ isDeleted: false }, 'name totalPoints').sort({ totalPoints: -1 }).exec();

    // For Category distribution
    const subJunior = await this.studentModel.countDocuments({ category: 'subJunior' });
    const junior = await this.studentModel.countDocuments({ category: 'junior' });
    const senior = await this.studentModel.countDocuments({ category: 'senior' });

    // Recent activity (e.g. recently updated results or competitions)
    const recentCompetitions = await this.competitionModel.find().sort({ updatedAt: -1 }).limit(5).exec();

    return {
      kpis: {
        totalStudents,
        totalGroups,
        totalCompetitions,
        resultsPublished,
      },
      groups: groups.map(g => ({ name: g.name, points: g.totalPoints })),
      studentCategories: [
        { type: 'Sub Junior', value: subJunior },
        { type: 'Junior', value: junior },
        { type: 'Senior', value: senior },
      ],
      recentActivity: recentCompetitions.map(c => ({
        id: c._id,
        name: c.name,
        status: c.status,
        updatedAt: (c as any).updatedAt,
      })),
    };
  }
}
