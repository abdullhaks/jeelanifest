import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result, ResultDocument, Winner } from './result.schema';
import { FinalResult, FinalResultDocument } from './final-result.schema';
import { SaveResultDraftDto, FinalAnnouncementDto } from './results.schemas';
import { Student, StudentDocument } from '../students/student.schema';
import { Group, GroupDocument } from '../groups/group.schema';
import { Competition, CompetitionDocument } from '../competitions/competition.schema';
import { RealtimeGateway } from '../socket/realtime.gateway';

@Injectable()
export class ResultsService implements OnModuleInit {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(FinalResult.name) private finalResultModel: Model<FinalResultDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Competition.name) private competitionModel: Model<CompetitionDocument>,
    private socketGateway: RealtimeGateway
  ) {}

  async onModuleInit() {
    try {
      await this.resultModel.updateMany(
        { 'winners.participantType': 'student' } as any,
        { $set: { 'winners.$[elem].participantType': 'Student' } },
        { arrayFilters: [{ 'elem.participantType': 'student' }] }
      ).exec();
      
      await this.resultModel.updateMany(
        { 'winners.participantType': 'group' } as any,
        { $set: { 'winners.$[elem].participantType': 'Group' } },
        { arrayFilters: [{ 'elem.participantType': 'group' }] }
      ).exec();
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  async saveDraft(dto: SaveResultDraftDto): Promise<Result> {
    return this.resultModel.findOneAndUpdate(
      { competition: dto.competition },
      { 
        $set: { 
          competition: dto.competition, 
          winners: dto.winners, 
          status: 'draft' 
        } 
      },
      { new: true, upsert: true }
    ).exec();
  }

  async findAll(): Promise<Result[]> {
    return this.resultModel.find().populate('competition').exec();
  }

  async getResultByCompetition(competitionId: string): Promise<Result | null> {
    return this.resultModel.findOne({ competition: competitionId })
      .populate({ path: 'winners.participant', select: 'name class group profileImage logoUrl', strictPopulate: false })
      .exec();
  }

  async getValidParticipants(competitionId: string): Promise<{ type: 'Group'|'Student', data: any[] }> {
    const comp = await this.competitionModel.findById(competitionId).exec();
    if (!comp) throw new NotFoundException('Competition not found');

    if (comp.type === 'group') {
      const groups = await this.groupModel.find({ isDeleted: false }, 'name logoUrl totalPoints').lean().exec();
      
      if (comp.groupEntries && comp.groupEntries.length > 0) {
        const flattened = [];
        for (const entry of comp.groupEntries) {
          const g = groups.find(x => x._id.toString() === entry.group.toString());
          if (g && entry.chestCodes) {
            for (const code of entry.chestCodes) {
              flattened.push({
                ...g,
                name: `${g.name} (${code})`,
                chestCode: code
              });
            }
          }
        }
        return { type: 'Group', data: flattened };
      }

      return { type: 'Group', data: groups };
    } else {
      const query: any = { 'programs.competition': comp._id };

      const students = await this.studentModel
        .find(query, 'name class category profileImage group')
        .populate('group', 'name')
        .exec();
        
      return { type: 'Student', data: students };
    }
  }

  async publishResult(id: string): Promise<Result> {
    const result = await this.resultModel.findById(id).exec();
    if (!result) throw new NotFoundException('Result not found');
    if (result.status === 'published') throw new BadRequestException('Result is already published');

    // Perform state updates sequentially to avoid distributed transaction requirement
    for (const winner of result.winners) {
      if (winner.participantType === 'Group') {
        await this.groupModel.findByIdAndUpdate(winner.participant, {
          $inc: { totalPoints: winner.pointsAwarded }
        });
      } else if (winner.participantType === 'Student') {
        const student = await this.studentModel.findById(winner.participant).exec();
        if (student) {
          // Increment student point
          student.points += winner.pointsAwarded;
          
          // Apply rank to programs array
          const programIndex = student.programs.findIndex(p => p.competition.toString() === result.competition.toString());
          if (programIndex >= 0) {
            student.programs[programIndex].rankAwarded = winner.rank;
          } else {
            // Failsafe in case program wasn't manually attached earlier
            student.programs.push({
              competition: result.competition,
              rankAwarded: winner.rank
            });
          }
          await student.save();

          // Cascade points to student's group
          if (student.group) {
            await this.groupModel.findByIdAndUpdate(student.group, {
              $inc: { totalPoints: winner.pointsAwarded }
            });
          }
        }
      }
    }

    result.status = 'published';
    await result.save();

    // Populate for socket payload
    const populatedResult = await this.resultModel.findById(id)
      .populate('competition', 'name type category stage status')
      .populate({ path: 'winners.participant', select: 'name profileImage logoUrl class groupName', strictPopulate: false })
      .exec();

    this.socketGateway.emitEvent('result:published', populatedResult);
    this.socketGateway.emitEvent('points:updated', { timestamp: new Date() });
    return populatedResult!;
  }

  async updatePublishedResult(id: string, dto: SaveResultDraftDto): Promise<Result> {
    const result = await this.resultModel.findById(id).exec();
    if (!result) throw new NotFoundException('Result not found');

    // 1. If currently published, revert points and ranks from previous winners
    if (result.status === 'published') {
      for (const winner of result.winners) {
        if (winner.participantType === 'Group') {
          await this.groupModel.findByIdAndUpdate(winner.participant, {
            $inc: { totalPoints: -winner.pointsAwarded }
          });
        } else if (winner.participantType === 'Student') {
          const student = await this.studentModel.findById(winner.participant).exec();
          if (student) {
            student.points = Math.max(0, student.points - winner.pointsAwarded);
            const programIndex = student.programs.findIndex(p => p.competition.toString() === result.competition.toString());
            if (programIndex >= 0) {
              student.programs[programIndex].rankAwarded = null;
            }
            await student.save();

            if (student.group) {
              await this.groupModel.findByIdAndUpdate(student.group, {
                $inc: { totalPoints: -winner.pointsAwarded }
              });
            }
          }
        }
      }
    }

    // 2. Update winners list
    result.winners = dto.winners as any;
    result.status = 'published';
    await result.save();

    // 3. Apply points and ranks for updated winners
    for (const winner of result.winners) {
      if (winner.participantType === 'Group') {
        await this.groupModel.findByIdAndUpdate(winner.participant, {
          $inc: { totalPoints: winner.pointsAwarded }
        });
      } else if (winner.participantType === 'Student') {
        const student = await this.studentModel.findById(winner.participant).exec();
        if (student) {
          student.points += winner.pointsAwarded;
          
          const programIndex = student.programs.findIndex(p => p.competition.toString() === result.competition.toString());
          if (programIndex >= 0) {
            student.programs[programIndex].rankAwarded = winner.rank;
          } else {
            student.programs.push({
              competition: result.competition,
              rankAwarded: winner.rank
            });
          }
          await student.save();

          if (student.group) {
            await this.groupModel.findByIdAndUpdate(student.group, {
              $inc: { totalPoints: winner.pointsAwarded }
            });
          }
        }
      }
    }

    const populatedResult = await this.resultModel.findById(id)
      .populate('competition', 'name type category stage status')
      .populate({ path: 'winners.participant', select: 'name profileImage logoUrl class groupName', strictPopulate: false })
      .exec();

    this.socketGateway.emitEvent('result:published', populatedResult);
    this.socketGateway.emitEvent('points:updated', { timestamp: new Date() });
    return populatedResult!;
  }

  async announceFinal(dto: FinalAnnouncementDto): Promise<FinalResult> {
    const existing = await this.finalResultModel.findOne().exec();
    let finalRes;
    
    if (existing) {
      existing.firstPlaceGroup = dto.firstPlaceGroup as any;
      existing.secondPlaceGroup = dto.secondPlaceGroup as any;
      existing.thirdPlaceGroup = dto.thirdPlaceGroup as any;
      existing.publishedAt = new Date();
      finalRes = await existing.save();
    } else {
      finalRes = await new this.finalResultModel(dto).save();
    }

    const populated = await this.finalResultModel.findById(finalRes._id)
      .populate('firstPlaceGroup', 'name logoUrl totalPoints')
      .populate('secondPlaceGroup', 'name logoUrl totalPoints')
      .populate('thirdPlaceGroup', 'name logoUrl totalPoints')
      .exec();

    this.socketGateway.emitEvent('final:announced', populated);
    return populated!;
  }
}
