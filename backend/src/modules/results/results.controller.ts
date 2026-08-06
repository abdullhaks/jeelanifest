import { Controller, Get, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { ResultsService } from './results.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { SaveResultDraftDto, FinalAnnouncementDto } from './results.schemas';
import { saveResultDraftSchema, finalAnnouncementSchema } from './results.schemas';

@Controller('results')
@UseGuards(AuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  saveDraft(@Body(new ZodValidationPipe(saveResultDraftSchema)) dto: SaveResultDraftDto) {
    return this.resultsService.saveDraft(dto);
  }

  @Get('competition/:competitionId')
  getResultByCompetition(@Param('competitionId') compId: string) {
    return this.resultsService.getResultByCompetition(compId);
  }

  @Get('participants/:competitionId')
  getValidParticipants(@Param('competitionId') compId: string) {
    return this.resultsService.getValidParticipants(compId);
  }

  @Post(':id/publish')
  publishResult(@Param('id') id: string) {
    return this.resultsService.publishResult(id);
  }

  @Post('final-announcement')
  announceFinal(@Body(new ZodValidationPipe(finalAnnouncementSchema)) dto: FinalAnnouncementDto) {
    return this.resultsService.announceFinal(dto);
  }
}
