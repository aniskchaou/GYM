import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassStatus } from '@prisma/client';

@Injectable()
export class PtSessionsService {
  constructor(private prisma: PrismaService) {}

  /** List sessions visible to the user. */
  async list(user: { id: string; role: string; gymId?: string | null }) {
    if (user.role === 'TRAINER') {
      const tp = await this.prisma.trainerProfile.findUnique({ where: { userId: user.id } });
      if (!tp) return [];
      return this.prisma.ptSession.findMany({
        where: { trainerId: tp.id },
        include: { member: { include: { user: true } }, trainer: { include: { user: true } } },
        orderBy: { startTime: 'desc' },
      });
    }
    if (user.role === 'MEMBER') {
      const mp = await this.prisma.memberProfile.findUnique({ where: { userId: user.id } });
      if (!mp) return [];
      return this.prisma.ptSession.findMany({
        where: { memberId: mp.id },
        include: { trainer: { include: { user: true } }, member: { include: { user: true } } },
        orderBy: { startTime: 'desc' },
      });
    }
    // Staff: list everything in their gym
    return this.prisma.ptSession.findMany({
      where: { member: { user: { gymId: user.gymId ?? undefined } } },
      include: {
        member: { include: { user: true } },
        trainer: { include: { user: true } },
      },
      orderBy: { startTime: 'desc' },
      take: 200,
    });
  }

  async create(dto: {
    trainerUserId: string;
    memberUserId: string;
    startTime: string;
    endTime: string;
    sessionNumber?: number;
    totalSessions?: number;
    pricePerSession: number;
    notes?: string;
  }) {
    const trainer = await this.prisma.trainerProfile.findUnique({ where: { userId: dto.trainerUserId } });
    if (!trainer) throw new BadRequestException('Trainer profile not found');
    const member = await this.prisma.memberProfile.findUnique({ where: { userId: dto.memberUserId } });
    if (!member) throw new BadRequestException('Member profile not found');
    return this.prisma.ptSession.create({
      data: {
        trainerId: trainer.id,
        memberId: member.id,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        sessionNumber: dto.sessionNumber ?? 1,
        totalSessions: dto.totalSessions ?? 1,
        pricePerSession: dto.pricePerSession,
        notes: dto.notes,
      },
      include: { trainer: { include: { user: true } }, member: { include: { user: true } } },
    });
  }

  async update(id: string, dto: any) {
    const s = await this.prisma.ptSession.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Session not found');
    return this.prisma.ptSession.update({
      where: { id },
      data: {
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
        ...(dto.status !== undefined && { status: dto.status as ClassStatus }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.trainerNotes !== undefined && { trainerNotes: dto.trainerNotes }),
      },
    });
  }

  async cancel(id: string) {
    const s = await this.prisma.ptSession.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Session not found');
    return this.prisma.ptSession.update({ where: { id }, data: { status: ClassStatus.CANCELLED } });
  }

  async complete(id: string, trainerNotes?: string) {
    const s = await this.prisma.ptSession.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Session not found');
    return this.prisma.ptSession.update({
      where: { id },
      data: { status: ClassStatus.COMPLETED, trainerNotes },
    });
  }
}
