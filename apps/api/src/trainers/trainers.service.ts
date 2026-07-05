import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class TrainersService {
  constructor(private prisma: PrismaService) {}

  async findAll(gymId: string) {
    const users = await this.prisma.user.findMany({
      where: { gymId, role: UserRole.TRAINER },
      include: { trainerProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({
      id: u.trainerProfile?.id ?? u.id,
      user: {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        isActive: u.isActive,
      },
      specialties: u.trainerProfile?.specialties ?? [],
      certifications: u.trainerProfile?.certifications ?? [],
      bio: u.trainerProfile?.bio,
      rating: u.trainerProfile?.rating,
      isActive: u.isActive,
    }));
  }

  async create(gymId: string, dto: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(dto.password ?? 'Trainer@1234', 10);
    const user = await this.prisma.user.create({
      data: {
        gymId,
        role: UserRole.TRAINER,
        email: dto.email,
        passwordHash: hash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });
    const profile = await this.prisma.trainerProfile.create({
      data: {
        userId: user.id,
        specialties: dto.specialties ?? [],
        bio: dto.bio,
      },
    });
    return {
      id: profile.id,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
      specialties: profile.specialties,
      bio: profile.bio,
    };
  }

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { trainerProfile: true },
    });
    return user;
  }

  async updateProfile(userId: string, dto: any) {
    const fields: any = {};
    ['specialties','bio','certifications','sessionRate','commissionPercent'].forEach(k => {
      if (dto[k] !== undefined) fields[k] = dto[k];
    });
    return this.prisma.trainerProfile.update({ where: { userId }, data: fields });
  }

  /** Members assigned to this trainer (via memberProfile.assignedTrainerId) */
  async getMyClients(userId: string, gymId: string) {
    // Fetch members whose profile has this trainer assigned, or all gym members as fallback
    const members = await this.prisma.user.findMany({
      where: { gymId, role: 'MEMBER' },
      include: {
        memberProfile: true,
        memberships: { where: { status: 'ACTIVE' }, include: { plan: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Filter to members assigned to this trainer (if assignment field exists)
    const filtered = members.filter(m =>
      !(m.memberProfile as any)?.assignedTrainerId ||
      (m.memberProfile as any)?.assignedTrainerId === userId
    );
    return filtered;
  }

  async createAssessment(trainerId: string, dto: {
    memberId: string; notes: string; goals: string[];
    fitnessLevel: string; weight?: number; height?: number; bodyFat?: number;
  }) {
    const profile = await this.prisma.memberProfile.findFirst({ where: { userId: dto.memberId } });
    if (!profile) throw new Error('Member profile not found');
    // Store as body measurement + update goals
    const updates: any[] = [];
    if (dto.weight || dto.height || dto.bodyFat) {
      updates.push(this.prisma.bodyMeasurement.create({
        data: {
          memberId: profile.id,
          weightKg: dto.weight,
          heightCm: dto.height,
          bodyFatPct: dto.bodyFat,
          notes: `Assessment by trainer. Level: ${dto.fitnessLevel}. ${dto.notes}`,
        },
      }));
    }
    if (dto.goals?.length) {
      updates.push(this.prisma.memberProfile.update({
        where: { id: profile.id },
        data: { fitnessGoals: dto.goals },
      }));
    }
    await Promise.all(updates);
    return { success: true, memberId: dto.memberId, fitnessLevel: dto.fitnessLevel, goals: dto.goals, notes: dto.notes };
  }

  async getMyAssessments(trainerId: string) {
    // Return recent body measurements created by this trainer's gym members
    const trainerUser = await this.prisma.user.findUnique({ where: { id: trainerId } });
    if (!trainerUser?.gymId) return [];
    return this.prisma.bodyMeasurement.findMany({
      where: { member: { user: { gymId: trainerUser.gymId } } },
      include: { member: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }

  async sendMessage(senderId: string, memberId: string, message: string) {
    // Use notifications as the message transport
    return this.prisma.notification.create({
      data: {
        userId: memberId,
        title: 'Message from your trainer',
        body: message,
        type: 'IN_APP' as any,
        status: 'PENDING' as any,
      },
    });
  }
}
