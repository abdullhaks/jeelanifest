import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './group.schema';
import { Student, StudentDocument } from '../students/student.schema';
import { Result, ResultDocument } from '../results/result.schema';
import { CreateGroupDto, UpdateGroupDto } from './groups.schemas';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';

@Injectable()
export class GroupsService implements OnModuleInit {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {}

  async onModuleInit() {
    try {
      const groups = await this.groupModel.find().exec();
      for (const g of groups) {
        if (g.name && g.name !== g.name.trim().toUpperCase()) {
          g.name = g.name.trim().toUpperCase();
          await g.save();
        }
      }
    } catch (e) {
      console.error('Migration error for group names:', e);
    }
  }

  async create(createDto: CreateGroupDto): Promise<Group> {
    const nameUpper = createDto.name.trim().toUpperCase();
    createDto.name = nameUpper;
    const escapedName = nameUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const existing = await this.groupModel.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
      isDeleted: false
    }).exec();
    if (existing) {
      throw new BadRequestException(`Group with name "${nameUpper}" already exists`);
    }

    this.validateLeaders(createDto.members, createDto.leaders);
    const created = new this.groupModel(createDto);
    return created.save();
  }

  private async getMembersForGroup(groupId: any, rawMembers: any[] = []): Promise<Student[]> {
    if (!groupId) return [];
    const groupIdStr = groupId.toString();
    let groupObjId: any = groupId;
    try {
      if (Types.ObjectId.isValid(groupIdStr)) {
        groupObjId = new Types.ObjectId(groupIdStr);
      }
    } catch (e) {}

    // 1. Query students collection by group field (String or ObjectId)
    let students = await this.studentModel
      .find(
        { group: { $in: [groupId, groupIdStr, groupObjId] } },
        'name chestNo class profileImage points category'
      )
      .exec();

    // 2. If empty, check if rawMembers array on Group model has student ObjectIds
    if ((!students || students.length === 0) && Array.isArray(rawMembers) && rawMembers.length > 0) {
      const memberIds = rawMembers.map(m => typeof m === 'object' && m ? (m._id || m) : m).filter(Boolean);
      if (memberIds.length > 0) {
        students = await this.studentModel
          .find(
            { _id: { $in: memberIds } },
            'name chestNo class profileImage points category'
          )
          .exec();
      }
    }

    return students || [];
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<Group>> {
    // Default filter for soft deletes
    let filters: Record<string, any> = { isDeleted: false };
    
    if (query.filter) {
      try {
        const parsed = JSON.parse(query.filter);
        filters = { ...filters, ...parsed };
      } catch (e) {
        // Ignore JSON errors
      }
    }

    const paginated = await paginate<GroupDocument>(
      this.groupModel,
      query,
      ['name'], // searchable fields
      filters
    );

    // Attach members to each group dynamically for table display
    const groupsWithMembers = await Promise.all(
      paginated.data.map(async (groupDoc) => {
        const group = typeof (groupDoc as any).toObject === 'function' ? (groupDoc as any).toObject() : groupDoc;
        const students = await this.getMembersForGroup(group._id, group.members);
        group.members = students as any;
        group.membersCount = students.length;
        group.studentCount = students.length;
        return group as any;
      })
    );

    return { ...paginated, data: groupsWithMembers };
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel
      .findOne({ _id: id, isDeleted: false })
      .populate('leaders')
      .lean()
      .exec();
      
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    const students = await this.getMembersForGroup(group._id, (group as any).members);
    group.members = students as any;
    (group as any).membersCount = students.length;
    (group as any).studentCount = students.length;

    return group as any;
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

    const students = await this.getMembersForGroup(group._id, (group as any).members);
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

  async update(id: string, updateDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    if (updateDto.name) {
      const nameUpper = updateDto.name.trim().toUpperCase();
      updateDto.name = nameUpper;
      const escapedName = nameUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const existing = await this.groupModel.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
        isDeleted: false
      }).exec();
      if (existing) {
        throw new BadRequestException(`Group with name "${nameUpper}" already exists`);
      }
    }

    // Since members are managed by Student collection, fetch them to validate leaders
    const students = await this.studentModel.find({ group: id }).exec();
    const currentMemberIds = students.map(s => s._id.toString());
    
    const leaders = updateDto.leaders ?? group.leaders.map(l => l.toString());
    this.validateLeaders(currentMemberIds, leaders);

    const updated = await this.groupModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
      
    if (!updated) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const group = await this.groupModel.findOneAndUpdate(
      { _id: id, isDeleted: false }, 
      { isDeleted: true },
      { new: true }
    ).exec();

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }

  /**
   * Ensure all leader IDs exist in the members array
   */
  private validateLeaders(members: string[], leaders: string[]) {
    if (!leaders || leaders.length === 0) return;
    for (const leader of leaders) {
      if (!members.includes(leader)) {
        throw new BadRequestException('All leaders must also be members of the group');
      }
    }
  }
}

