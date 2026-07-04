import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.config.get('API_URL', 'http://localhost:4000/api/v1');
    for (const sub of ['images', 'videos', 'audio', 'documents']) {
      const dir = path.join(this.uploadsDir, sub);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  }

  saveFile(file: Express.Multer.File, folder: 'images' | 'videos' | 'audio' | 'documents') {
    const ext = path.extname(file.originalname).toLowerCase() || this.mimeToExt(file.mimetype);
    const filename = `${randomUUID()}${ext}`;
    fs.writeFileSync(path.join(this.uploadsDir, folder, filename), file.buffer);
    return {
      url: `${this.baseUrl}/static/${folder}/${filename}`,
      filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  private mimeToExt(mime: string): string {
    const map: Record<string, string> = {
      'video/mp4': '.mp4', 'video/quicktime': '.mov', 'video/webm': '.webm',
      'audio/mpeg': '.mp3', 'audio/wav': '.wav', 'audio/mp4': '.m4a',
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
    };
    return map[mime] ?? '';
  }

  // kept so existing UploadsModule export stays valid
  private _placeholder() {}
  constructor(private prisma: PrismaService) {}
}
