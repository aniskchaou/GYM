import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus, ProgramLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  list(gymId: string, includeDrafts = false) {
    return this.prisma.program.findMany({
      where: { gymId, ...(includeDrafts ? {} : { isPublished: true }) },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { schedule: true, enrollments: true } },
      },
    });
  }

  async get(gymId: string, id: string) {
    const p = await this.prisma.program.findFirst({
      where: { id, gymId },
      include: {
        schedule: { orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }] },
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!p) throw new NotFoundException('Program not found');
    return p;
  }

  create(gymId: string, authorId: string, dto: any) {
    return this.prisma.program.create({
      data: {
        gymId,
        authorId,
        title: dto.title,
        description: dto.description ?? null,
        goal: dto.goal ?? null,
        level: (dto.level as ProgramLevel) ?? ProgramLevel.BEGINNER,
        weeks: Number(dto.weeks ?? 4),
        imageUrl: dto.imageUrl ?? null,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async update(gymId: string, id: string, dto: any) {
    const p = await this.prisma.program.findFirst({ where: { id, gymId } });
    if (!p) throw new NotFoundException('Program not found');
    return this.prisma.program.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.goal !== undefined && { goal: dto.goal }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.weeks !== undefined && { weeks: Number(dto.weeks) }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async remove(gymId: string, id: string) {
    const p = await this.prisma.program.findFirst({ where: { id, gymId } });
    if (!p) throw new NotFoundException('Program not found');
    await this.prisma.programEnrollment.deleteMany({ where: { programId: id } });
    await this.prisma.programDay.deleteMany({ where: { programId: id } });
    await this.prisma.program.delete({ where: { id } });
    return { success: true };
  }

  // Schedule
  async upsertDay(
    gymId: string,
    programId: string,
    dto: { weekNumber: number; dayNumber: number; title?: string; content: any; videoUrl?: string },
  ) {
    const p = await this.prisma.program.findFirst({ where: { id: programId, gymId } });
    if (!p) throw new NotFoundException('Program not found');
    return this.prisma.programDay.upsert({
      where: {
        programId_weekNumber_dayNumber: {
          programId,
          weekNumber: Number(dto.weekNumber),
          dayNumber: Number(dto.dayNumber),
        },
      },
      create: {
        programId,
        weekNumber: Number(dto.weekNumber),
        dayNumber: Number(dto.dayNumber),
        title: dto.title ?? null,
        content: dto.content,
        videoUrl: dto.videoUrl ?? null,
      },
      update: {
        title: dto.title ?? undefined,
        content: dto.content ?? undefined,
        videoUrl: dto.videoUrl ?? undefined,
      },
    });
  }

  async deleteDay(gymId: string, programId: string, dayId: string) {
    const day = await this.prisma.programDay.findFirst({
      where: { id: dayId, programId, program: { gymId } },
    });
    if (!day) throw new NotFoundException('Day not found');
    await this.prisma.programDay.delete({ where: { id: dayId } });
    return { success: true };
  }

  // Enrollment & progress
  async enroll(gymId: string, userId: string, programId: string) {
    const p = await this.prisma.program.findFirst({ where: { id: programId, gymId, isPublished: true } });
    if (!p) throw new NotFoundException('Program not found');
    try {
      const en = await this.prisma.programEnrollment.create({
        data: { programId, userId, status: EnrollmentStatus.ACTIVE },
      });
      await this.events.emit(APP_EVENTS.PROGRAM_ENROLLED, {
        userId,
        gymId,
        meta: { programId },
      });
      return en;
    } catch {
      throw new BadRequestException('Already enrolled');
    }
  }

  async advance(userId: string, programId: string) {
    const en = await this.prisma.programEnrollment.findUnique({
      where: { programId_userId: { programId, userId } },
      include: { program: true },
    });
    if (!en) throw new NotFoundException('Enrollment not found');
    if (en.status !== EnrollmentStatus.ACTIVE) throw new BadRequestException('Not active');

    let week = en.currentWeek;
    let day = en.currentDay + 1;
    if (day > 7) {
      day = 1;
      week += 1;
    }
    const totalDays = en.program.weeks * 7;
    const completedDays = (week - 1) * 7 + (day - 1);
    const progress = Math.min(100, (completedDays / totalDays) * 100);
    const completed = week > en.program.weeks;

    const updated = await this.prisma.programEnrollment.update({
      where: { programId_userId: { programId, userId } },
      data: {
        currentWeek: completed ? en.program.weeks : week,
        currentDay: completed ? 7 : day,
        progress: completed ? 100 : progress,
        status: completed ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
        completedAt: completed ? new Date() : null,
      },
    });

    if (completed) {
      await this.events.emit(APP_EVENTS.PROGRAM_COMPLETED, {
        userId,
        gymId: en.program.gymId,
        meta: { programId },
      });
    }
    return updated;
  }

  async setStatus(userId: string, programId: string, status: EnrollmentStatus) {
    return this.prisma.programEnrollment.update({
      where: { programId_userId: { programId, userId } },
      data: { status },
    });
  }

  async myEnrollments(userId: string) {
    return this.prisma.programEnrollment.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        program: {
          include: { schedule: { orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }] } },
        },
      },
    });
  }
}
