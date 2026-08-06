import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { CreateStudentDto, UpdateStudentDto } from './students.schemas';
import { createStudentSchema, updateStudentSchema, assignProgramsSchema } from './students.schemas';
import type { PaginationQuery } from '../common/pagination.schema';
import { paginationQuerySchema } from '../common/pagination.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('students')
@UseGuards(AuthGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  create(@Body(new ZodValidationPipe(createStudentSchema)) createDto: CreateStudentDto) {
    return this.studentsService.create(createDto);
  }

  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file.buffer, 'jeelanifest/students');
    return { url: result.secure_url };
  }

  @Get()
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/valid-competitions')
  getValidCompetitions(@Param('id') id: string) {
    return this.studentsService.getValidCompetitions(id);
  }

  @Post(':id/programs')
  assignPrograms(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(assignProgramsSchema)) body: { competitionIds: string[] }
  ) {
    return this.studentsService.assignPrograms(id, body.competitionIds);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStudentSchema)) updateDto: UpdateStudentDto
  ) {
    return this.studentsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
