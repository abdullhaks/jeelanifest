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
import { GroupsService } from './groups.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { CreateGroupDto, UpdateGroupDto } from './groups.schemas';
import { createGroupSchema, updateGroupSchema } from './groups.schemas';
import type { PaginationQuery } from '../common/pagination.schema';
import { paginationQuerySchema } from '../common/pagination.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('groups')
@UseGuards(AuthGuard)
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  create(@Body(new ZodValidationPipe(createGroupSchema)) createDto: CreateGroupDto) {
    return this.groupsService.create(createDto);
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file.buffer, 'jeelanifest/groups');
    return { url: result.secure_url };
  }

  @Get()
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.groupsService.findAll(query);
  }

  @Get(':id/breakdown')
  getGroupBreakdown(@Param('id') id: string) {
    return this.groupsService.getGroupBreakdown(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateGroupSchema)) updateDto: UpdateGroupDto
  ) {
    return this.groupsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
