import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingContentDto, UpdateTrainingContentDto, QueryTrainingContentDto } from './dto/training-content.dto';

@Injectable()
export class TrainingContentService {
  constructor(private prisma: PrismaService) {}

  async create(trainerId: string, dto: CreateTrainingContentDto) {
    return this.prisma.trainingContent.create({
      data: {
        ...dto,
        trainerId,
        tags: dto.tags ?? [],
      },
      include: { trainer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  async findAll(query: QueryTrainingContentDto) {
    const where: any = { isPublished: true };
    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (query.gymId) where.gymId = query.gymId;
    if (query.trainerId) where.trainerId = query.trainerId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

    return this.prisma.trainingContent.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { views: true } },
      },
    });
  }

  async findMyContent(trainerId: string) {
    return this.prisma.trainingContent.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { views: true } } },
    });
  }

  async findOne(id: string) {
    const content = await this.prisma.trainingContent.findUnique({
      where: { id },
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, trainerProfile: true } },
        _count: { select: { views: true } },
      },
    });
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async update(id: string, trainerId: string, dto: UpdateTrainingContentDto) {
    const content = await this.prisma.trainingContent.findUnique({ where: { id } });
    if (!content) throw new NotFoundException('Content not found');
    if (content.trainerId !== trainerId) throw new ForbiddenException('Not your content');

    return this.prisma.trainingContent.update({
      where: { id },
      data: dto,
      include: { _count: { select: { views: true } } },
    });
  }

  async publish(id: string, trainerId: string) {
    const content = await this.prisma.trainingContent.findUnique({ where: { id } });
    if (!content) throw new NotFoundException('Content not found');
    if (content.trainerId !== trainerId) throw new ForbiddenException('Not your content');

    return this.prisma.trainingContent.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
  }

  async unpublish(id: string, trainerId: string) {
    const content = await this.prisma.trainingContent.findUnique({ where: { id } });
    if (!content) throw new NotFoundException('Content not found');
    if (content.trainerId !== trainerId) throw new ForbiddenException('Not your content');

    return this.prisma.trainingContent.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async remove(id: string, trainerId: string) {
    const content = await this.prisma.trainingContent.findUnique({ where: { id } });
    if (!content) throw new NotFoundException('Content not found');
    if (content.trainerId !== trainerId) throw new ForbiddenException('Not your content');

    await this.prisma.trainingContent.delete({ where: { id } });
    return { success: true };
  }

  async trackView(contentId: string, userId: string, progress: number) {
    // Increment view count atomically on first view only
    await this.prisma.contentView.upsert({
      where: { contentId_userId: { contentId, userId } },
      create: { id: require('crypto').randomUUID(), contentId, userId, progress },
      update: { progress, watchedAt: new Date() },
    });

    // Only count unique views
    const existing = await this.prisma.contentView.count({ where: { contentId, userId } });
    if (existing === 1) {
      await this.prisma.trainingContent.update({
        where: { id: contentId },
        data: { viewCount: { increment: 1 } },
      });
    }
  }

  async getCategories() {
    const results = await this.prisma.trainingContent.groupBy({
      by: ['category'],
      where: { isPublished: true, category: { not: null } },
    });
    return results.map((r) => r.category).filter(Boolean);
  }
}
