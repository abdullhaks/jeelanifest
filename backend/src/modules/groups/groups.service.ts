import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './group.schema';
import { Student, StudentDocument } from '../students/student.schema';
import { CreateGroupDto, UpdateGroupDto } from './groups.schemas';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(createDto: CreateGroupDto): Promise<Group> {
    this.validateLeaders(createDto.members, createDto.leaders);
    const created = new this.groupModel(createDto);
    return created.save();
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
        const group = groupDoc.toObject();
        const students = await this.studentModel.find({ group: group._id }, 'name class profileImage points category').exec();
        group.members = students as any;
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

    const students = await this.studentModel.find({ group: id }, 'name class profileImage points category').exec();
    group.members = students as any;

    return group as any;
  }

  async update(id: string, updateDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
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
