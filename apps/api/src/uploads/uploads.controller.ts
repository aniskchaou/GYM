import {
  Controller, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private service: UploadsService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload an image (jpg/png/webp, max 10 MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.service.saveFile(file, 'images');
  }

  @Post('video')
  @ApiOperation({ summary: 'Upload a training video (mp4/mov/webm, max 500 MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Invalid video format.');
    return this.service.saveFile(file, 'videos');
  }

  @Post('audio')
  @ApiOperation({ summary: 'Upload training audio (mp3/wav/m4a, max 100 MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg'];
    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Invalid audio format.');
    return this.service.saveFile(file, 'audio');
  }

  @Post('pdf')
  @ApiOperation({ summary: 'Upload a PDF document (max 20 MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Only PDF files accepted.');
    return this.service.saveFile(file, 'documents');
  }
}
