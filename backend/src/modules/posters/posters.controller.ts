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
import { PostersService } from './posters.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { CreatePosterDto, UpdatePosterDto } from './posters.schemas';
import { createPosterSchema, updatePosterSchema } from './posters.schemas';
import type { PaginationQuery } from '../common/pagination.schema';
import { paginationQuerySchema } from '../common/pagination.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('posters')
@UseGuards(AuthGuard)
export class PostersController {
  constructor(
    private readonly postersService: PostersService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  create(@Body(new ZodValidationPipe(createPosterSchema)) createDto: CreatePosterDto) {
    return this.postersService.create(createDto);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB for posters
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file.buffer, 'jeelanifest/posters');
    return { url: result.secure_url };
  }

  @Get()
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.postersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePosterSchema)) updateDto: UpdatePosterDto
  ) {
    return this.postersService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postersService.remove(id);
  }
}
