import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where: any = { isPublic: true };
    if (category && category !== 'ALL') where.category = category;
    return this.prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }
}
