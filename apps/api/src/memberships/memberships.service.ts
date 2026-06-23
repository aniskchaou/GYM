import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, createdById: string) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const startDate = new Date(dto.startDate || Date.now());
    const endDate = new Date(startDate.getTime() + plan.durationDays * 86400000);
    const finalPrice = dto.discount ? plan.price * (1 - dto.discount / 100) : plan.price;

    return this.prisma.membership.create({
      data: {
        memberId: dto.memberId,
        planId: dto.planId,
        createdById,
        startDate,
        endDate,
        autoRenew: dto.autoRenew ?? true,
        discount: dto.discount ?? 0,
        finalPrice,
        status: MembershipStatus.ACTIVE,
      },
      include: { plan: true, member: true },
    });
  }

  async findAll(gymId: string, query: any = {}) {
    const where: any = { member: { gymId } };
    if (query.status) where.status = query.status;
    const limit = query.limit ? parseInt(query.limit, 10) : undefined;
    return this.prisma.membership.findMany({
      where,
      include: { plan: true, member: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });
  }

  async findByMember(memberId: string) {
    return this.prisma.membership.findMany({
      where: { memberId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async freeze(id: string, frozenUntil: Date) {
    const m = await this.prisma.membership.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Membership not found');
    if (m.status !== MembershipStatus.ACTIVE) throw new BadRequestException('Membership is not active');

    return this.prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.FROZEN, frozenAt: new Date(), frozenUntil },
    });
  }

  async unfreeze(id: string) {
    const m = await this.prisma.membership.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Membership not found');

    // Extend end date by freeze duration
    const frozenDays = m.frozenAt
      ? Math.ceil((new Date().getTime() - m.frozenAt.getTime()) / 86400000)
      : 0;
    const newEndDate = new Date(m.endDate.getTime() + frozenDays * 86400000);

    return this.prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.ACTIVE, frozenAt: null, frozenUntil: null, endDate: newEndDate },
    });
  }

  async cancel(id: string, reason: string) {
    return this.prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.CANCELLED, cancelledAt: new Date(), cancelReason: reason },
    });
  }

  async renew(id: string, staffId: string, discount?: number) {
    const m = await this.prisma.membership.findUnique({ where: { id }, include: { plan: true } });
    if (!m) throw new NotFoundException('Membership not found');
    const plan = m.plan;
    const startDate = m.endDate > new Date() ? m.endDate : new Date();
    const endDate   = new Date(startDate.getTime() + plan.durationDays * 86400000);
    const finalPrice = discount ? plan.price * (1 - discount / 100) : plan.price;
    return this.prisma.membership.create({
      data: {
        memberId: m.memberId, planId: m.planId, createdById: staffId,
        startDate, endDate, autoRenew: m.autoRenew,
        discount: discount ?? 0, finalPrice,
        status: MembershipStatus.ACTIVE,
      },
      include: { plan: true, member: true },
    });
  }
}
