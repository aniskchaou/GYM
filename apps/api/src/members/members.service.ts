import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  private parseFitnessGoals(value: unknown) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || !value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').map((goal) => goal.trim()).filter(Boolean);
    }
  }

  async findAll(gymId: string, query: any = {}) {
    const { search, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { gymId, role: 'MEMBER' };
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { memberProfile: { memberNumber: { contains: search } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          memberProfile: true,
          memberships: {
            where: { status: { in: ['ACTIVE', 'FROZEN'] } },
            include: { plan: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findOne(id: string, gymId: string) {
    const member = await this.prisma.user.findFirst({
      where: { id, gymId, role: 'MEMBER' },
      include: {
        memberProfile: {
          include: {
            bodyMeasurements: { orderBy: { date: 'desc' }, take: 10 },
            goals: true,
          },
        },
        memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        attendances: { orderBy: { checkedInAt: 'desc' }, take: 20 },
        bookings: {
          include: { schedule: { include: { gymClass: true } } },
          orderBy: { bookedAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(id: string, gymId: string, dto: UpdateMemberDto) {
    const member = await this.prisma.user.findFirst({ where: { id, gymId } });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.user.update({
      where: { id },
      data: dto,
      include: { memberProfile: true },
    });
  }

  async getAttendanceHistory(memberId: string, gymId: string) {
    const member = await this.prisma.user.findFirst({ where: { id: memberId, gymId } });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.attendance.findMany({
      where: { userId: memberId },
      orderBy: { checkedInAt: 'desc' },
      take: 50,
    });
  }

  async addBodyMeasurement(memberId: string, dto: any) {
    const profile = await this.prisma.memberProfile.findFirst({ where: { userId: memberId } });
    if (!profile) throw new NotFoundException('Member profile not found');

    return this.prisma.bodyMeasurement.create({
      data: {
        memberId: profile.id,
        date: dto.date,
        weightKg: dto.weightKg ?? dto.weight,
        heightCm: dto.heightCm ?? dto.height,
        bodyFatPct: dto.bodyFatPct ?? dto.bodyFat,
        chestCm: dto.chestCm ?? dto.chest,
        waistCm: dto.waistCm ?? dto.waist,
        hipsCm: dto.hipsCm ?? dto.hips,
        armCm: dto.armCm ?? dto.biceps,
        thighCm: dto.thighCm ?? dto.thigh,
        notes: dto.notes,
      },
    });
  }

  async getMyMeasurements(memberId: string) {
    const profile = await this.prisma.memberProfile.findFirst({ where: { userId: memberId } });
    if (!profile) throw new NotFoundException('Member profile not found');

    return this.prisma.bodyMeasurement.findMany({
      where: { memberId: profile.id },
      orderBy: { date: 'desc' },
      take: 20,
    });
  }

  async getMembershipCard(memberId: string) {
    const profile = await this.prisma.memberProfile.findFirst({
      where: { userId: memberId },
      include: { user: true },
    });
    if (!profile) throw new NotFoundException('Member profile not found');
    return {
      memberId: profile.userId,
      memberNumber: profile.memberNumber,
      qrCode: profile.qrCode,
      rfidTag: profile.rfidTag,
      fitnessGoals: this.parseFitnessGoals(profile.fitnessGoals),
      name: `${profile.user.firstName} ${profile.user.lastName}`,
    };
  }

  async assignTrainer(memberId: string, gymId: string, trainerId: string) {
    const member = await this.prisma.user.findFirst({ where: { id: memberId, gymId } });
    if (!member) throw new NotFoundException('Member not found');
    const trainer = await this.prisma.user.findFirst({ where: { id: trainerId, gymId } });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return this.prisma.memberProfile.updateMany({
      where: { userId: memberId },
      data: { assignedTrainerId: trainerId } as any,
    });
  }

  async getPendingMemberships(gymId: string) {
    return this.prisma.user.findMany({
      where: { gymId, role: 'MEMBER', memberships: { none: { status: 'ACTIVE' } } },
      include: {
        memberProfile: true,
        memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComplaint(memberId: string, gymId: string, dto: { subject: string; description: string; priority?: string }) {
    const member = await this.prisma.user.findFirst({ where: { id: memberId, gymId } });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.supportTicket.create({
      data: {
        gymId,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
      },
    });
  }

  async listComplaints(gymId: string) {
    return this.prisma.supportTicket.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveComplaint(ticketId: string, gymId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, gymId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.prisma.supportTicket.update({ where: { id: ticketId }, data: { status: 'RESOLVED' as any } });
  }
}
