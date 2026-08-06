import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query,
  Put
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { 
  CreateCompetitionDto,
  UpdateCompetitionDto
} from './competitions.schemas';
import { 
  createCompetitionSchema, 
  updateCompetitionSchema, 
  updateStatusSchema
} from './competitions.schemas';
import { paginationQuerySchema } from '../common/pagination.schema';
import type { PaginationQuery } from '../common/pagination.schema';

@Controller('competitions')
@UseGuards(AuthGuard)
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createCompetitionSchema)) createDto: CreateCompetitionDto
  ) {
    return this.competitionsService.create(createDto);
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery
  ) {
    return this.competitionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competitionsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCompetitionSchema)) updateDto: UpdateCompetitionDto
  ) {
    return this.competitionsService.update(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStatusSchema)) body: { status: string }
  ) {
    return this.competitionsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.competitionsService.remove(id);
  }
}
