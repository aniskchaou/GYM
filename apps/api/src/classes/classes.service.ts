import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll(gymId: string) {
    return this.prisma.gymClass.findMany({
      where: { gymId },
      include: {
        schedules: {
          include: {
            trainer: { select: { firstName: true, lastName: true } },
          },
          orderBy: { startTime: 'asc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(gymId: string, dto: any) {
    return this.prisma.gymClass.create({
      data: {
        gymId,
        name: dto.name,
        description: dto.description,
        category: dto.category ?? 'general',
        duration: dto.duration ? parseInt(dto.duration, 10) : 60,
        difficulty: dto.difficulty,
      },
    });
  }
}
