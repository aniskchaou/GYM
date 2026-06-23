import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipPlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(gymId: string, query: any = {}) {
    const where: any = { gymId };
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true' || query.isActive === true;
    return this.prisma.membershipPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(gymId: string, dto: any) {
    return this.prisma.membershipPlan.create({
      data: {
        gymId,
        name: dto.name,
        description: dto.description,
        type: dto.type ?? 'MONTHLY',
        price: parseFloat(dto.price),
        currency: dto.currency ?? 'EUR',
        durationDays: dto.durationDays ? parseInt(dto.durationDays, 10) : 30,
        features: dto.features ?? [],
      },
    });
  }
}
