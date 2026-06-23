import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(gymId: string) {
    return this.prisma.branch.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(gymId: string, dto: any) {
    return this.prisma.branch.create({
      data: {
        gymId,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        phone: dto.phone,
        email: dto.email,
        capacity: dto.capacity ? parseInt(dto.capacity, 10) : 100,
      },
    });
  }
}
