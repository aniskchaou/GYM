import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  list(gymId: string) {
    return this.prisma.activity.findMany({
      where: { gymId },
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { participants: true } } },
    });
  }

  get(gymId: string, id: string) {
    return this.prisma.activity.findFirst({
      where: { id, gymId },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
  }

  create(gymId: string, dto: any) {
    return this.prisma.activity.create({
      data: {
        gymId,
        title: dto.title,
        description: dto.description ?? null,
        type: dto.type ?? 'challenge',
        rules: dto.rules ?? null,
        rewardPoints: Number(dto.rewardPoints ?? 0),
        badgeName: dto.badgeName ?? null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? ActivityStatus.ACTIVE,
        imageUrl: dto.imageUrl ?? null,
      },
    });
  }

  async update(gymId: string, id: string, dto: any) {
    const a = await this.prisma.activity.findFirst({ where: { id, gymId } });
    if (!a) throw new NotFoundException('Activity not found');
    return this.prisma.activity.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.rules !== undefined && { rules: dto.rules }),
        ...(dto.rewardPoints !== undefined && { rewardPoints: Number(dto.rewardPoints) }),
        ...(dto.badgeName !== undefined && { badgeName: dto.badgeName }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
    });
  }

  async remove(gymId: string, id: string) {
    const a = await this.prisma.activity.findFirst({ where: { id, gymId } });
    if (!a) throw new NotFoundException('Activity not found');
    await this.prisma.activityParticipant.deleteMany({ where: { activityId: id } });
    await this.prisma.activity.delete({ where: { id } });
    return { success: true };
  }

  async join(gymId: string, userId: string, activityId: string) {
    const activity = await this.prisma.activity.findFirst({ where: { id: activityId, gymId } });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.status !== ActivityStatus.ACTIVE) throw new BadRequestException('Activity not active');
    if (activity.endDate < new Date()) throw new BadRequestException('Activity ended');
    try {
      const p = await this.prisma.activityParticipant.create({
        data: { activityId, userId },
      });
      await this.events.emit(APP_EVENTS.ACTIVITY_JOINED, {
        userId,
        gymId,
        meta: { activityId },
      });
      return p;
    } catch {
      throw new BadRequestException('Already joined');
    }
  }

  async submitProgress(userId: string, activityId: string, dto: { progress: number; submission?: any }) {
    const participant = await this.prisma.activityParticipant.findUnique({
      where: { activityId_userId: { activityId, userId } },
    });
    if (!participant) throw new NotFoundException('Not a participant');
    const completed = dto.progress >= 100;
    const updated = await this.prisma.activityParticipant.update({
      where: { activityId_userId: { activityId, userId } },
      data: {
        progress: Math.max(0, Math.min(100, dto.progress)),
        submission: dto.submission ?? participant.submission ?? undefined,
        completed,
        completedAt: completed && !participant.completed ? new Date() : participant.completedAt,
      },
    });

    if (completed && !participant.completed) {
      const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
      await this.events.emit(APP_EVENTS.ACTIVITY_COMPLETED, {
        userId,
        gymId: activity?.gymId,
        meta: { activityId, rewardPoints: activity?.rewardPoints ?? 0, badge: activity?.badgeName },
      });
    }
    return updated;
  }

  leaderboard(gymId: string, activityId: string) {
    return this.prisma.activityParticipant.findMany({
      where: { activityId, activity: { gymId } },
      orderBy: [{ completed: 'desc' }, { progress: 'desc' }],
      take: 50,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  myActivities(userId: string) {
    return this.prisma.activityParticipant.findMany({
      where: { userId },
      include: { activity: true },
      orderBy: { joinedAt: 'desc' },
    });
  }
}
