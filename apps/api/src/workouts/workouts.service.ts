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

  async listPlans(user: { id: string; role: string; gymId?: string | null }) {
    if (user.role === 'MEMBER') {
      const profile = await this.prisma.memberProfile.findUnique({ where: { userId: user.id } });
      if (!profile) return [];
      return this.prisma.workoutPlan.findMany({
        where: { memberId: profile.id },
        include: {
          member: { include: { user: true } },
          days: { include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } }, orderBy: { dayOfWeek: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.workoutPlan.findMany({
      where: { member: { user: { gymId: user.gymId ?? undefined } } },
      include: {
        member: { include: { user: true } },
        days: { include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } }, orderBy: { dayOfWeek: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createPlan(dto: any) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId: dto.memberUserId } });
    if (!profile) throw new Error('Member profile not found');

    return this.prisma.workoutPlan.create({
      data: {
        memberId: profile.id,
        title: dto.title,
        description: dto.description ?? null,
        weeks: Number(dto.weeks ?? 4),
        goals: dto.goals ?? [],
        days: {
          create: (dto.days ?? []).map((day: any) => ({
            dayOfWeek: Number(day.dayOfWeek ?? 1),
            name: day.name ?? null,
            exercises: {
              create: (day.exercises ?? []).map((exercise: any, index: number) => ({
                exerciseId: exercise.exerciseId,
                sets: exercise.sets ? Number(exercise.sets) : undefined,
                reps: exercise.reps ?? undefined,
                weight: exercise.weight ?? undefined,
                duration: exercise.duration ? Number(exercise.duration) : undefined,
                restTime: exercise.restTime ? Number(exercise.restTime) : undefined,
                notes: exercise.notes ?? undefined,
                order: index,
              })),
            },
          })),
        },
      },
      include: {
        member: { include: { user: true } },
        days: { include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } }, orderBy: { dayOfWeek: 'asc' } },
      },
    });
  }

  async deletePlan(id: string) {
    await this.prisma.workoutPlan.delete({ where: { id } });
    return { success: true };
  }
}
