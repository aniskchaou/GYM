import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoyaltyTxnType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

const POINTS_RULES = {
  CHECK_IN: 5,
  PURCHASE_PER_EUR: 1,
  ACTIVITY_COMPLETED_DEFAULT: 50,
  CLASS_JOINED: 10,
  REFERRAL: 100,
};

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  // ─── Tiers ───
  listTiers(gymId: string) {
    return this.prisma.loyaltyTier.findMany({ where: { gymId }, orderBy: { minPoints: 'asc' } });
  }

  createTier(gymId: string, dto: any) {
    return this.prisma.loyaltyTier.create({
      data: {
        gymId,
        name: dto.name,
        minPoints: Number(dto.minPoints ?? 0),
        perks: dto.perks ?? [],
        multiplier: Number(dto.multiplier ?? 1),
        color: dto.color ?? '#a3a3a3',
      },
    });
  }

  async updateTier(gymId: string, id: string, dto: any) {
    const t = await this.prisma.loyaltyTier.findFirst({ where: { id, gymId } });
    if (!t) throw new NotFoundException('Tier not found');
    return this.prisma.loyaltyTier.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.minPoints !== undefined && { minPoints: Number(dto.minPoints) }),
        ...(dto.perks !== undefined && { perks: dto.perks }),
        ...(dto.multiplier !== undefined && { multiplier: Number(dto.multiplier) }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async deleteTier(gymId: string, id: string) {
    const t = await this.prisma.loyaltyTier.findFirst({ where: { id, gymId } });
    if (!t) throw new NotFoundException('Tier not found');
    await this.prisma.loyaltyTier.delete({ where: { id } });
    return { success: true };
  }

  // ─── Rewards ───
  listRewards(gymId: string) {
    return this.prisma.loyaltyReward.findMany({
      where: { gymId, isActive: true },
      orderBy: { costPoints: 'asc' },
    });
  }

  createReward(gymId: string, dto: any) {
    return this.prisma.loyaltyReward.create({
      data: {
        gymId,
        name: dto.name,
        description: dto.description ?? null,
        costPoints: Number(dto.costPoints),
        stock: dto.stock != null ? Number(dto.stock) : null,
        imageUrl: dto.imageUrl ?? null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateReward(gymId: string, id: string, dto: any) {
    const r = await this.prisma.loyaltyReward.findFirst({ where: { id, gymId } });
    if (!r) throw new NotFoundException('Reward not found');
    return this.prisma.loyaltyReward.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.costPoints !== undefined && { costPoints: Number(dto.costPoints) }),
        ...(dto.stock !== undefined && { stock: dto.stock != null ? Number(dto.stock) : null }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteReward(gymId: string, id: string) {
    const r = await this.prisma.loyaltyReward.findFirst({ where: { id, gymId } });
    if (!r) throw new NotFoundException('Reward not found');
    await this.prisma.loyaltyReward.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }

  // ─── Account & ledger ───
  async myAccount(userId: string, gymId?: string) {
    let acc = await this.prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!acc) {
      acc = await this.prisma.loyaltyAccount.create({ data: { userId } });
    }
    const recent = await this.prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { ...acc, transactions: recent };
  }

  async awardPoints(
    userId: string,
    gymId: string | undefined,
    points: number,
    reason: string,
    reference?: string,
  ) {
    if (points === 0) return null;
    const account = await this.ensureAccount(userId);
    const tiers = gymId
      ? await this.prisma.loyaltyTier.findMany({ where: { gymId }, orderBy: { minPoints: 'asc' } })
      : [];
    const multiplier = this.multiplierFor(account.tier, tiers);
    const earned = Math.round(points * multiplier);
    const newPoints = account.points + earned;
    const newLifetime = account.lifetimePoints + Math.max(0, earned);
    const newTier = this.computeTier(newLifetime, tiers, account.tier);

    const [updated, txn] = await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { userId },
        data: { points: newPoints, lifetimePoints: newLifetime, tier: newTier },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          userId,
          type: earned >= 0 ? LoyaltyTxnType.EARN : LoyaltyTxnType.ADJUST,
          points: earned,
          reason,
          reference: reference ?? null,
        },
      }),
    ]);

    await this.events.emit(APP_EVENTS.POINTS_AWARDED, {
      userId,
      gymId,
      meta: { points: earned, reason, total: newPoints },
    });
    if (newTier !== account.tier) {
      await this.events.emit(APP_EVENTS.TIER_UPGRADED, {
        userId,
        gymId,
        meta: { from: account.tier, to: newTier },
      });
    }
    return { account: updated, txn };
  }

  async redeem(userId: string, gymId: string, rewardId: string) {
    const reward = await this.prisma.loyaltyReward.findFirst({
      where: { id: rewardId, gymId, isActive: true },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    if (reward.stock != null && reward.stock <= 0) throw new BadRequestException('Out of stock');
    const account = await this.ensureAccount(userId);
    if (account.points < reward.costPoints) throw new BadRequestException('Not enough points');

    const updates: any[] = [
      this.prisma.loyaltyAccount.update({
        where: { userId },
        data: { points: account.points - reward.costPoints },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          userId,
          type: LoyaltyTxnType.REDEEM,
          points: -reward.costPoints,
          reason: 'reward',
          reference: reward.id,
        },
      }),
    ];
    if (reward.stock != null) {
      updates.push(
        this.prisma.loyaltyReward.update({
          where: { id: reward.id },
          data: { stock: reward.stock - 1 },
        }),
      );
    }
    await this.prisma.$transaction(updates);
    await this.events.emit(APP_EVENTS.REWARD_REDEEMED, {
      userId,
      gymId,
      meta: { rewardId: reward.id, name: reward.name, cost: reward.costPoints },
    });
    return { success: true, reward };
  }

  async leaderboard(gymId: string) {
    // Look up accounts for members of this gym
    const members = await this.prisma.user.findMany({
      where: { gymId, isActive: true },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
    });
    const accounts = await this.prisma.loyaltyAccount.findMany({
      where: { userId: { in: members.map((m) => m.id) } },
      orderBy: { lifetimePoints: 'desc' },
      take: 50,
    });
    const byId = new Map(members.map((m) => [m.id, m]));
    return accounts.map((a) => ({ ...a, user: byId.get(a.userId) ?? null }));
  }

  // ─── Listeners ───
  @OnEvent(APP_EVENTS.MEMBER_CHECKED_IN)
  onCheckIn(p: any) {
    return this.awardPoints(p.userId, p.gymId, POINTS_RULES.CHECK_IN, 'attendance').catch(() => null);
  }

  @OnEvent(APP_EVENTS.PRODUCT_PURCHASED)
  onPurchase(p: any) {
    const total = Number(p?.meta?.totalAmount ?? 0);
    return this.awardPoints(
      p.userId,
      p.gymId,
      Math.floor(total * POINTS_RULES.PURCHASE_PER_EUR),
      'purchase',
      p?.meta?.orderId,
    ).catch(() => null);
  }

  @OnEvent(APP_EVENTS.ACTIVITY_COMPLETED)
  onActivityComplete(p: any) {
    return this.awardPoints(
      p.userId,
      p.gymId,
      Number(p?.meta?.rewardPoints ?? POINTS_RULES.ACTIVITY_COMPLETED_DEFAULT),
      'challenge',
      p?.meta?.activityId,
    ).catch(() => null);
  }

  @OnEvent(APP_EVENTS.CLASS_JOINED)
  onClassJoined(p: any) {
    return this.awardPoints(p.userId, p.gymId, POINTS_RULES.CLASS_JOINED, 'class').catch(() => null);
  }

  // ─── Helpers ───
  private async ensureAccount(userId: string) {
    const existing = await this.prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.loyaltyAccount.create({ data: { userId } });
  }

  private computeTier(lifetimePoints: number, tiers: any[], fallback: string): string {
    if (!tiers.length) return fallback;
    let current = tiers[0].name;
    for (const t of tiers) {
      if (lifetimePoints >= t.minPoints) current = t.name;
    }
    return current;
  }

  private multiplierFor(tierName: string, tiers: any[]): number {
    return tiers.find((t) => t.name === tierName)?.multiplier ?? 1;
  }
}
