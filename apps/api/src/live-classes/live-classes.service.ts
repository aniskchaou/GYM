import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LiveClassStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

@Injectable()
export class LiveClassesService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  list(gymId: string) {
    return this.prisma.liveClass.findMany({
      where: { gymId },
      orderBy: { startTime: 'asc' },
      include: {
        host: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { participants: true } },
      },
    });
  }

  async get(gymId: string, id: string) {
    const lc = await this.prisma.liveClass.findFirst({
      where: { id, gymId },
      include: {
        host: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
    if (!lc) throw new NotFoundException('Live class not found');
    return lc;
  }

  create(gymId: string, hostId: string, dto: any) {
    return this.prisma.liveClass.create({
      data: {
        gymId,
        hostId: dto.hostId ?? hostId,
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category ?? null,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        capacity: Number(dto.capacity ?? 100),
        streamUrl: dto.streamUrl ?? null,
        replayUrl: dto.replayUrl ?? null,
        status: dto.status ?? LiveClassStatus.SCHEDULED,
      },
    });
  }

  async update(gymId: string, id: string, dto: any) {
    const lc = await this.prisma.liveClass.findFirst({ where: { id, gymId } });
    if (!lc) throw new NotFoundException('Live class not found');
    return this.prisma.liveClass.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
        ...(dto.capacity !== undefined && { capacity: Number(dto.capacity) }),
        ...(dto.streamUrl !== undefined && { streamUrl: dto.streamUrl }),
        ...(dto.replayUrl !== undefined && { replayUrl: dto.replayUrl }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(gymId: string, id: string) {
    const lc = await this.prisma.liveClass.findFirst({ where: { id, gymId } });
    if (!lc) throw new NotFoundException('Live class not found');
    await this.prisma.liveClassMessage.deleteMany({ where: { liveClassId: id } });
    await this.prisma.liveClassParticipant.deleteMany({ where: { liveClassId: id } });
    await this.prisma.liveClass.delete({ where: { id } });
    return { success: true };
  }

  async setStatus(gymId: string, id: string, status: LiveClassStatus) {
    const lc = await this.prisma.liveClass.findFirst({ where: { id, gymId } });
    if (!lc) throw new NotFoundException('Live class not found');
    return this.prisma.liveClass.update({ where: { id }, data: { status } });
  }

  async join(gymId: string, userId: string, id: string) {
    const lc = await this.prisma.liveClass.findFirst({ where: { id, gymId } });
    if (!lc) throw new NotFoundException('Live class not found');
    if (lc.status === LiveClassStatus.CANCELLED || lc.status === LiveClassStatus.ENDED) {
      throw new BadRequestException('Class is not joinable');
    }
    const count = await this.prisma.liveClassParticipant.count({
      where: { liveClassId: id, leftAt: null },
    });
    if (count >= lc.capacity) throw new BadRequestException('Class is full');

    const existing = await this.prisma.liveClassParticipant.findUnique({
      where: { liveClassId_userId: { liveClassId: id, userId } },
    });
    if (existing && !existing.leftAt) return existing;
    if (existing) {
      return this.prisma.liveClassParticipant.update({
        where: { liveClassId_userId: { liveClassId: id, userId } },
        data: { joinedAt: new Date(), leftAt: null },
      });
    }
    const p = await this.prisma.liveClassParticipant.create({
      data: { liveClassId: id, userId },
    });
    await this.events.emit(APP_EVENTS.CLASS_JOINED, {
      userId,
      gymId,
      meta: { liveClassId: id, kind: 'live' },
    });
    return p;
  }

  async leave(userId: string, id: string) {
    return this.prisma.liveClassParticipant.update({
      where: { liveClassId_userId: { liveClassId: id, userId } },
      data: { leftAt: new Date() },
    });
  }

  async listMessages(id: string) {
    return this.prisma.liveClassMessage.findMany({
      where: { liveClassId: id },
      orderBy: { createdAt: 'asc' },
      take: 200,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  async postMessage(userId: string, id: string, content: string) {
    if (!content?.trim()) throw new BadRequestException('Empty message');
    return this.prisma.liveClassMessage.create({
      data: { liveClassId: id, userId, content: content.slice(0, 500) },
    });
  }
}
