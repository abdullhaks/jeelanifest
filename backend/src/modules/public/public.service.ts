import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from '../groups/group.schema';
import { Student, StudentDocument } from '../students/student.schema';
import { Competition, CompetitionDocument } from '../competitions/competition.schema';
import { Result, ResultDocument } from '../results/result.schema';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';
import { NotFoundException } from '@nestjs/common';

import { GalleryImage, GalleryImageDocument } from '../gallery/gallery.schema';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Competition.name) private competitionModel: Model<CompetitionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(GalleryImage.name) private galleryModel: Model<GalleryImageDocument>,
  ) {}

  async getDashboardGroups() {
    const groups = await this.groupModel.find({ isDeleted: false }).sort({ totalPoints: -1 }).select('name logoUrl totalPoints').exec();
    return groups.map(g => ({
      _id: g._id,
      name: g.name,
      logoUrl: g.logoUrl,
      points: g.totalPoints,
      totalPoints: g.totalPoints
    }));
  }

  async getGroupAnalytics(filter: string = 'overall') {
    const allGroups = await this.groupModel.find({ isDeleted: false }).select('name logoUrl totalPoints').exec();
    
    if (filter === 'group') {
      // 1. Group Items filter:
      // Find all group competitions (type === 'group')
      const groupCompetitions = await this.competitionModel.find({ type: 'group' }).select('_id').exec();
      const groupCompIds = groupCompetitions.map(c => c._id.toString());

      // Fetch published results with populated competition and participant details
      const results = await this.resultModel.find({ status: 'published' })
        .populate('competition')
        .populate({
          path: 'winners.participant',
          populate: { path: 'group', strictPopulate: false },
          strictPopulate: false
        })
        .exec();

      const pointsMap: Record<string, number> = {};

      results.forEach(r => {
        const comp = r.competition as any;
        // Check if competition is a group event
        if (comp && (comp.type === 'group' || groupCompIds.includes(comp._id.toString()))) {
          r.winners?.forEach(w => {
            let gId: string | null = null;
            if (w.participantType === 'Group' && w.participant) {
              const part = w.participant as any;
              gId = part._id ? part._id.toString() : part.toString();
            } else if (w.participantType === 'Student' && w.participant) {
              const student = w.participant as any;
              if (student.group) {
                gId = student.group._id ? student.group._id.toString() : student.group.toString();
              }
            }

            if (gId) {
              pointsMap[gId] = (pointsMap[gId] || 0) + (w.pointsAwarded || 0);
            }
          });
        }
      });

      return allGroups.map(g => ({
        _id: g._id,
        name: g.name,
        logoUrl: g.logoUrl,
        points: pointsMap[g._id.toString()] || 0,
        totalPoints: g.totalPoints,
      })).sort((a, b) => b.points - a.points);
    }

    if (['subJunior', 'junior', 'senior'].includes(filter)) {
      // 2. Category filter (subJunior / junior / senior):
      // Aggregate student points by category and group by house/group ID
      const studentPoints = await this.studentModel.aggregate([
        { $match: { category: filter } },
        { $group: { _id: '$group', totalCatPoints: { $sum: '$points' } } }
      ]);

      const pointsMap: Record<string, number> = {};
      studentPoints.forEach(sp => {
        if (sp._id) {
          pointsMap[sp._id.toString()] = sp.totalCatPoints || 0;
        }
      });

      return allGroups.map(g => ({
        _id: g._id,
        name: g.name,
        logoUrl: g.logoUrl,
        points: pointsMap[g._id.toString()] || 0,
        totalPoints: g.totalPoints,
      })).sort((a, b) => b.points - a.points);
    }

    // 3. Default: Overall points
    return allGroups.map(g => ({
      _id: g._id,
      name: g.name,
      logoUrl: g.logoUrl,
      points: g.totalPoints,
      totalPoints: g.totalPoints,
    })).sort((a, b) => b.points - a.points);
  }

  async getProAnalyticsData() {
    const [groups, students, ongoing, stats, recentResults, competitions] = await Promise.all([
      this.groupModel.find({ isDeleted: false }).sort({ totalPoints: -1 }).exec(),
      this.studentModel.find({ points: { $gt: 0 } }).sort({ points: -1 }).populate('group', 'name logoUrl').exec(),
      this.competitionModel.find({ status: 'started' }).exec(),
      this.getDashboardStats(),
      this.resultModel.find({ status: 'published' }).sort({ updatedAt: -1 }).limit(10).populate('competition').populate({ path: 'winners.participant', strictPopulate: false }).exec(),
      this.competitionModel.find().exec(),
    ]);

    // Calculate category breakdown per house
    const subJuniorPoints = await this.studentModel.aggregate([
      { $match: { category: 'subJunior' } },
      { $group: { _id: '$group', points: { $sum: '$points' } } }
    ]);
    const juniorPoints = await this.studentModel.aggregate([
      { $match: { category: 'junior' } },
      { $group: { _id: '$group', points: { $sum: '$points' } } }
    ]);
    const seniorPoints = await this.studentModel.aggregate([
      { $match: { category: 'senior' } },
      { $group: { _id: '$group', points: { $sum: '$points' } } }
    ]);

    const subMap: Record<string, number> = {};
    const junMap: Record<string, number> = {};
    const senMap: Record<string, number> = {};
    subJuniorPoints.forEach(p => { if (p._id) subMap[p._id.toString()] = p.points; });
    juniorPoints.forEach(p => { if (p._id) junMap[p._id.toString()] = p.points; });
    seniorPoints.forEach(p => { if (p._id) senMap[p._id.toString()] = p.points; });

    const matrix = groups.map(g => {
      const gId = g._id.toString();
      return {
        _id: g._id,
        name: g.name,
        logoUrl: g.logoUrl,
        totalPoints: g.totalPoints,
        subJunior: subMap[gId] || 0,
        junior: junMap[gId] || 0,
        senior: senMap[gId] || 0,
      };
    });

    return {
      groups,
      matrix,
      topStudents: students.slice(0, 15),
      ongoing,
      stats,
      recentResults,
      totalCompetitions: competitions.length,
      endedCompetitions: competitions.filter(c => c.status === 'ended').length,
    };
  }

  async getDashboardStudents() {
    // Only fetch needed fields for the talent race
    return this.studentModel
      .find({ points: { $gt: 0 } }) // Only students with points
      .sort({ points: -1 })
      .select('name chestNo category points profileImage class')
      .populate('group', 'name')
      .exec();
  }

  async getOngoingPrograms() {
    return this.competitionModel
      .find({ status: 'started' })
      .sort({ updatedAt: -1 })
      .select('name type category stage status date time')
      .exec();
  }

  async getDashboardStats() {
    const [groupCount, studentCount, competitionCount] = await Promise.all([
      this.groupModel.countDocuments({ isDeleted: false }),
      this.studentModel.countDocuments(),
      this.competitionModel.countDocuments(),
    ]);

    return {
      groupCount,
      studentCount,
      competitionCount,
    };
  }

  // --- Phase 12: Paginated Public Listings ---

  async getResults(query: PaginationQuery): Promise<PaginatedResult<Result>> {
    const filters: any = { status: 'published' }; // STRICTLY ENFORCED: Never show draft results
    
    if (query.filter) {
      try {
        const parsed = JSON.parse(query.filter);
        if (parsed.category) filters.category = parsed.category;
      } catch (e) {}
    }

    return paginate<ResultDocument>(
      this.resultModel,
      query,
      [], // no direct searchable string fields on Result root usually
      filters,
      { populate: ['competition', { path: 'winners.participant', strictPopulate: false }] }
    );
  }

  async getResultById(id: string): Promise<Result> {
    const result = await this.resultModel
      .findOne({ _id: id, status: 'published' })
      .populate('competition')
      .populate({ path: 'winners.participant', strictPopulate: false })
      .exec();
    if (!result) throw new NotFoundException('Result not found or not published');
    return result;
  }

  async getGalleryImages(query: PaginationQuery): Promise<PaginatedResult<GalleryImage>> {
    return paginate<GalleryImageDocument>(
      this.galleryModel,
      query,
      ['description'],
      {},
      {}
    );
  }

  async getGroups(query: PaginationQuery): Promise<PaginatedResult<Group>> {
    return paginate<GroupDocument>(
      this.groupModel,
      query,
      ['name'],
      {},
      {}
    );
  }

  async getGroupById(id: string): Promise<Group> {
    const group = await this.groupModel.findById(id).exec();
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async getStudents(query: PaginationQuery): Promise<PaginatedResult<Student>> {
    const filters: any = {};
    if (query.filter) {
      try {
        const parsed = JSON.parse(query.filter);
        if (parsed.group) filters.group = parsed.group;
        if (parsed.category) filters.category = parsed.category;
      } catch (e) {}
    }

    return paginate<StudentDocument>(
      this.studentModel,
      query,
      ['name', 'chestNo'],
      filters,
      { populate: ['group'] }
    );
  }

  async getStudentById(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).populate('group').exec();
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }
}
