import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from '../groups/group.schema';
import { Student, StudentDocument } from '../students/student.schema';
import { Competition, CompetitionDocument } from '../competitions/competition.schema';
import { Result, ResultDocument } from '../results/result.schema';
import { FinalResult, FinalResultDocument } from '../results/final-result.schema';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';
import { GalleryImage, GalleryImageDocument } from '../gallery/gallery.schema';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Competition.name) private competitionModel: Model<CompetitionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(FinalResult.name) private finalResultModel: Model<FinalResultDocument>,
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
    const allGroups = await this.groupModel.find({ isDeleted: false }).sort({ name: 1 }).select('name logoUrl totalPoints').exec();
    
    // Fetch all published results sorted chronologically by updatedAt
    const publishedResults = await this.resultModel.find({ status: 'published' })
      .sort({ updatedAt: 1 })
      .populate('competition')
      .populate({
        path: 'winners.participant',
        populate: { path: 'group', strictPopulate: false },
        strictPopulate: false
      })
      .exec();

    // Filter published results according to the filter param
    const filteredResults = publishedResults.filter(r => {
      const comp = r.competition as any;
      if (!comp) return false;
      if (filter === 'group') {
        return comp.type === 'group';
      }
      if (['subJunior', 'junior', 'senior'].includes(filter)) {
        const catNorm = (comp.category || '').toLowerCase().replace(/\s+/g, '');
        const filterNorm = filter.toLowerCase().replace(/\s+/g, '');
        return catNorm === filterNorm;
      }
      return true; // 'overall'
    });

    // Build milestones timeline
    const groupCumulativePoints: Record<string, number> = {};
    allGroups.forEach(g => {
      groupCumulativePoints[g._id.toString()] = 0;
    });

    const milestones: any[] = [];

    // Milestone 0: Start
    const startPoint: any = {
      milestone: 'Start',
      label: 'Start',
      competitionName: 'Fest Launch',
    };
    allGroups.forEach(g => {
      startPoint[g._id.toString()] = 0;
    });
    milestones.push(startPoint);

    // Iterative Milestones per published result
    filteredResults.forEach((r, idx) => {
      const comp = r.competition as any;
      const compName = comp?.name || `Result ${idx + 1}`;
      const milestoneKey = `M${idx + 1}`;

      // Award points from this result
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

        if (gId && groupCumulativePoints[gId] !== undefined) {
          groupCumulativePoints[gId] += (w.pointsAwarded || 0);
        }
      });

      const milestonePoint: any = {
        milestone: milestoneKey,
        label: milestoneKey,
        competitionName: compName,
      };

      allGroups.forEach(g => {
        const gId = g._id.toString();
        milestonePoint[gId] = groupCumulativePoints[gId] || 0;
      });

      milestones.push(milestonePoint);
    });

    // Formulate final response containing group info list & milestone graph timeline
    const groupSummaries = allGroups.map(g => ({
      _id: g._id,
      name: g.name,
      logoUrl: g.logoUrl,
      points: groupCumulativePoints[g._id.toString()] || 0,
      totalPoints: g.totalPoints,
    })).sort((a, b) => b.points - a.points);

    return {
      groups: groupSummaries.map(g => ({
        _id: g._id.toString(),
        name: g.name,
        logoUrl: g.logoUrl,
        points: g.points,
        totalPoints: g.totalPoints
      })),
      milestones,
    };
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
    const isObjectId = Types.ObjectId.isValid(id);
    const query: any = isObjectId
      ? {
          $or: [{ _id: new Types.ObjectId(id) }, { competition: new Types.ObjectId(id) }],
          status: 'published',
        }
      : { status: 'published' };

    const result = await this.resultModel
      .findOne(query)
      .populate('competition')
      .populate({
        path: 'winners.participant',
        populate: { path: 'group', select: 'name logoUrl', strictPopulate: false },
        strictPopulate: false,
      })
      .exec();
    if (!result) throw new NotFoundException('Result not found or not published');
    return result;
  }

  async getFinalResult() {
    return this.finalResultModel.findOne()
      .populate('firstPlaceGroup', 'name logoUrl totalPoints')
      .populate('secondPlaceGroup', 'name logoUrl totalPoints')
      .populate('thirdPlaceGroup', 'name logoUrl totalPoints')
      .exec();
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

  async getGroupBreakdown(id: string) {
    const group = await this.groupModel
      .findOne({ _id: id, isDeleted: false })
      .populate('leaders')
      .lean()
      .exec();

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    const students = await this.studentModel
      .find(
        { group: { $in: [id, id.toString()] } },
        'name chestNo class profileImage points category'
      )
      .exec();

    const studentMap = new Map(students.map((s: any) => [s._id.toString(), s]));

    const publishedResults = await this.resultModel
      .find({ status: 'published' })
      .populate('competition')
      .populate({ path: 'winners.participant', strictPopulate: false })
      .exec();

    const pointBreakdown: any[] = [];
    const groupIdStr = id.toString();

    for (const res of publishedResults) {
      const comp = res.competition as any;
      if (!comp) continue;
      const winners = res.winners || [];
      for (const w of winners) {
        if (w.participantType === 'Student') {
          const part = w.participant as any;
          const partId = part?._id ? part._id.toString() : (part ? part.toString() : null);
          if (partId && studentMap.has(partId)) {
            const st = studentMap.get(partId)!;
            pointBreakdown.push({
              id: `${res._id}_${w.rank}_${partId}`,
              competitionId: comp._id,
              competitionName: comp.name,
              category: comp.category,
              competitionType: comp.type || 'student',
              participantType: 'Student',
              participantId: partId,
              participantName: st.name,
              participantPhoto: st.profileImage || null,
              chestCode: w.chestCode || (st as any).chestNo || '',
              rank: w.rank,
              pointsAwarded: w.pointsAwarded || 0,
              updatedAt: (res as any).updatedAt || (res as any).createdAt,
            });
          }
        } else if (w.participantType === 'Group') {
          const part = w.participant as any;
          const partId = part?._id ? part._id.toString() : (part ? part.toString() : null);
          if (partId === groupIdStr) {
            pointBreakdown.push({
              id: `${res._id}_${w.rank}_${groupIdStr}`,
              competitionId: comp._id,
              competitionName: comp.name,
              category: comp.category,
              competitionType: comp.type || 'group',
              participantType: 'Group',
              participantId: groupIdStr,
              participantName: w.chestCode ? `Group (${w.chestCode})` : 'Group Entry',
              participantPhoto: group.logoUrl || null,
              chestCode: w.chestCode || '',
              rank: w.rank,
              pointsAwarded: w.pointsAwarded || 0,
              updatedAt: (res as any).updatedAt || (res as any).createdAt,
            });
          }
        }
      }
    }

    pointBreakdown.sort((a, b) => b.pointsAwarded - a.pointsAwarded);

    const membersList = students.map((s: any) => ({
      _id: s._id,
      name: s.name,
      chestNo: s.chestNo || 'N/A',
      class: s.class,
      category: s.category,
      profileImage: s.profileImage,
      points: s.points || 0,
    }));

    const topScorers = [...membersList]
      .filter(m => m.points > 0)
      .sort((a, b) => b.points - a.points);

    return {
      group: {
        ...group,
        membersCount: membersList.length,
        studentCount: membersList.length,
      },
      topScorers,
      members: membersList.sort((a, b) => a.name.localeCompare(b.name)),
      pointBreakdown,
      totalPoints: group.totalPoints || 0,
    };
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

  async getStudentById(id: string): Promise<any> {
    const student = await this.studentModel
      .findById(id)
      .populate('group')
      .populate('programs.competition')
      .lean()
      .exec();
    if (!student) throw new NotFoundException('Student not found');

    const publishedResults = await this.resultModel
      .find({ status: 'published' })
      .populate('competition')
      .lean()
      .exec();

    const compResultMap = new Map<string, any>();
    const studentIdStr = student._id.toString();
    const groupIdStr = student.group?._id
      ? student.group._id.toString()
      : (student.group ? student.group.toString() : null);

    for (const res of publishedResults) {
      if (res.competition?._id) {
        compResultMap.set(res.competition._id.toString(), res);
      } else if (res.competition) {
        compResultMap.set(res.competition.toString(), res);
      }
    }

    const enrichedPrograms = (student.programs || []).map((p: any) => {
      const compId = p.competition?._id
        ? p.competition._id.toString()
        : (p.competition ? p.competition.toString() : null);

      const res = compId ? compResultMap.get(compId) : null;
      let rank = p.rankAwarded || null;
      let pointsAwarded = p.pointsAwarded || 0;
      const resultId = res ? res._id.toString() : null;

      if (res && res.winners) {
        // Match student winner
        const studentWinner = res.winners.find((w: any) => {
          const partId = w.participant?._id
            ? w.participant._id.toString()
            : (w.participant ? w.participant.toString() : null);
          return partId === studentIdStr;
        });

        // Match group winner if group event
        const groupWinner =
          !studentWinner && groupIdStr && p.competition?.type === 'group'
            ? res.winners.find((w: any) => {
                const partId = w.participant?._id
                  ? w.participant._id.toString()
                  : (w.participant ? w.participant.toString() : null);
                return partId === groupIdStr;
              })
            : null;

        const winnerMatch = studentWinner || groupWinner;

        if (winnerMatch) {
          rank = winnerMatch.rank || rank;
          pointsAwarded = winnerMatch.pointsAwarded || pointsAwarded;
        }
      }

      return {
        ...p,
        rankAwarded: rank,
        pointsAwarded,
        resultId,
        hasWon: Boolean(rank && ['1st', '2nd', '3rd'].includes(rank)),
      };
    });

    return {
      ...student,
      programs: enrichedPrograms,
    };
  }
}
