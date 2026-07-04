import { Module } from '@nestjs/common';
import { TrainingContentController } from './training-content.controller';
import { TrainingContentService } from './training-content.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrainingContentController],
  providers: [TrainingContentService],
  exports: [TrainingContentService],
})
export class TrainingContentModule {}
