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
import { GalleryService } from './gallery.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { CreateGalleryImageDto, UpdateGalleryImageDto } from './gallery.schemas';
import { createGalleryImageSchema, updateGalleryImageSchema } from './gallery.schemas';
import type { PaginationQuery } from '../common/pagination.schema';
import { paginationQuerySchema } from '../common/pagination.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('gallery')
@UseGuards(AuthGuard)
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  create(@Body(new ZodValidationPipe(createGalleryImageSchema)) createDto: CreateGalleryImageDto) {
    return this.galleryService.create(createDto);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file.buffer, 'jeelanifest/gallery');
    return { url: result.secure_url };
  }

  @Get()
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.galleryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateGalleryImageSchema)) updateDto: UpdateGalleryImageDto
  ) {
    return this.galleryService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
