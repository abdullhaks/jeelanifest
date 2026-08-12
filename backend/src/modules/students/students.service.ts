import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './student.schema';
import { CreateStudentDto, UpdateStudentDto } from './students.schemas';
import { PaginationQuery } from '../common/pagination.schema';
import { paginate, PaginatedResult } from '../common/paginate.helper';
import { Competition, CompetitionDocument } from '../competitions/competition.schema';

@Injectable()
export class StudentsService implements OnModuleInit {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Competition.name) private competitionModel: Model<CompetitionDocument>,
  ) {}

  async onModuleInit() {
    try {
      const students = await this.studentModel.find().exec();
      for (const s of students) {
        if (s.name && s.name !== s.name.trim().toUpperCase()) {
          s.name = s.name.trim().toUpperCase();
          await s.save();
        }
      }
    } catch (e) {
      console.error('Migration error for student names:', e);
    }
  }

  async create(createDto: CreateStudentDto): Promise<Student> {
    const nameUpper = createDto.name.trim().toUpperCase();
    createDto.name = nameUpper;
    const escapedName = nameUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const existing = await this.studentModel.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
      class: createDto.class
    }).exec();
    if (existing) {
      throw new BadRequestException(`Student with name "${nameUpper}" already exists in class ${createDto.class}`);
    }

    const created = new this.studentModel(createDto);
    return created.save();
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<Student>> {
    let filters: Record<string, any> = {};
    if (query.filter) {
      try {
        filters = JSON.parse(query.filter);
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    return paginate<StudentDocument>(
      this.studentModel,
      query,
      ['name', 'chestNo'], // searchable fields
      filters,
      { populate: ['group', 'programs.competition'] } // options
    );
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel
      .findById(id)
      .populate('group')
      .populate('programs.competition')
      .exec();
      
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(id: string, updateDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (updateDto.name) {
      const nameUpper = updateDto.name.trim().toUpperCase();
      updateDto.name = nameUpper;
      const escapedName = nameUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const targetClass = updateDto.class || student.class;

      const existing = await this.studentModel.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
        class: targetClass
      }).exec();
      if (existing) {
        throw new BadRequestException(`Student with name "${nameUpper}" already exists in class ${targetClass}`);
      }
    }

    const updated = await this.studentModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
      
    if (!updated) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.studentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }

  async getValidCompetitions(id: string): Promise<Competition[]> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) throw new NotFoundException(`Student with ID ${id} not found`);

    // Individual competitions where the student's category is enabled
    const individualQuery = {
      type: 'individual',
      category: { $in: [student.category, 'general', null] }
    };

    // Group competitions are generally valid for any student belonging to a group
    const groupQuery = {
      type: 'group'
    };

    return this.competitionModel.find({
      $or: [individualQuery, groupQuery]
    } as any).exec();
  }

  async assignPrograms(id: string, competitionIds: string[]): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) throw new NotFoundException(`Student with ID ${id} not found`);

    // We want to map new competitionIds but preserve rankAwarded if they were already assigned
    const existingPrograms = student.programs || [];
    
    const newPrograms = competitionIds.map(compId => {
      const existing = existingPrograms.find(p => p.competition.toString() === compId);
      return {
        competition: new Types.ObjectId(compId),
        rankAwarded: existing ? existing.rankAwarded : null,
      };
    });

    student.programs = newPrograms;
    return student.save();
  }
}
