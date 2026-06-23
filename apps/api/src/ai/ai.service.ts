import { Injectable } from '@nestjs/common';
import { InsightType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface UserSignal {
  userId: string;
  firstName: string;
  lastName: string;
  daysSinceLastAttendance: number;
  attendances30d: number;
  failedPayments30d: number;
  hasActiveMembership: boolean;
  loyaltyPoints: number;
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  // ─── Member insights ───
  async listInsights(gymId: string, type?: InsightType) {
    return this.prisma.aiInsight.findMany({
      where: { gymId, ...(type ? { type } : {}) },
      orderBy: { score: 'desc' },
      take: 200,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } } },
    });
  }

  async runScoring(gymId: string) {
    const signals = await this.buildSignals(gymId);
    const created: any[] = [];

    // Clear prior insights for this gym (keep storage lean)
    await this.prisma.aiInsight.deleteMany({ where: { gymId } });

    for (const s of signals) {
      const churn = this.scoreChurn(s);
      const upgrade = this.scoreUpgrade(s);
      const engagement = this.scoreEngagement(s);

      if (churn >= 60) {
        created.push(
          await this.prisma.aiInsight.create({
            data: {
              gymId,
              userId: s.userId,
              type: InsightType.CHURN_RISK,
              score: churn,
              summary: `${s.firstName} ${s.lastName} hasn't visited in ${s.daysSinceLastAttendance} days.`,
              details: s as any,
            },
          }),
        );
      }
      if (upgrade >= 60) {
        created.push(
          await this.prisma.aiInsight.create({
            data: {
              gymId,
              userId: s.userId,
              type: InsightType.UPGRADE_PROPENSITY,
              score: upgrade,
              summary: `${s.firstName} ${s.lastName} shows strong engagement — likely to upgrade.`,
              details: s as any,
            },
          }),
        );
      }
      if (engagement >= 70) {
        created.push(
          await this.prisma.aiInsight.create({
            data: {
              gymId,
              userId: s.userId,
              type: InsightType.HIGH_ENGAGEMENT,
              score: engagement,
              summary: `${s.firstName} ${s.lastName} is a power user (${s.attendances30d} visits in 30d).`,
              details: s as any,
            },
          }),
        );
      }
      if (!s.hasActiveMembership && s.attendances30d === 0) {
        created.push(
          await this.prisma.aiInsight.create({
            data: {
              gymId,
              userId: s.userId,
              type: InsightType.INACTIVITY,
              score: 80,
              summary: `${s.firstName} ${s.lastName} has lapsed — no active membership and no visits.`,
              details: s as any,
            },
          }),
        );
      }
    }
    return { count: created.length };
  }

  private async buildSignals(gymId: string): Promise<UserSignal[]> {
    const members = await this.prisma.user.findMany({
      where: { gymId, isActive: true, role: 'MEMBER' as any },
      select: { id: true, firstName: true, lastName: true },
      take: 2000,
    });

    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return Promise.all(
      members.map(async (m) => {
        const [lastAttendance, attendances30d, failedPayments30d, activeMembership, loyalty] =
          await Promise.all([
            this.prisma.attendance.findFirst({
              where: { userId: m.id },
              orderBy: { checkedInAt: 'desc' },
              select: { checkedInAt: true },
            }),
            this.prisma.attendance.count({
              where: { userId: m.id, checkedInAt: { gte: since30 } },
            }),
            this.prisma.payment.count({
              where: { userId: m.id, status: 'FAILED', createdAt: { gte: since30 } },
            }),
            this.prisma.membership.findFirst({
              where: { memberId: m.id, status: 'ACTIVE' },
            }),
            this.prisma.loyaltyAccount.findUnique({ where: { userId: m.id } }),
          ]);

        const days = lastAttendance
          ? Math.floor((now.getTime() - lastAttendance.checkedInAt.getTime()) / 86400000)
          : 999;

        return {
          userId: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          daysSinceLastAttendance: days,
          attendances30d,
          failedPayments30d,
          hasActiveMembership: !!activeMembership,
          loyaltyPoints: loyalty?.points ?? 0,
        };
      }),
    );
  }

  private scoreChurn(s: UserSignal): number {
    let score = 0;
    score += Math.min(60, s.daysSinceLastAttendance * 2);
    score += s.failedPayments30d * 15;
    score += s.attendances30d === 0 ? 20 : 0;
    score -= s.hasActiveMembership ? 0 : -10;
    return Math.max(0, Math.min(100, score));
  }

  private scoreUpgrade(s: UserSignal): number {
    let score = 0;
    score += Math.min(40, s.attendances30d * 2);
    score += s.loyaltyPoints >= 500 ? 20 : 0;
    score += s.hasActiveMembership ? 10 : 0;
    return Math.max(0, Math.min(100, score));
  }

  private scoreEngagement(s: UserSignal): number {
    let score = 0;
    score += Math.min(60, s.attendances30d * 3);
    score += Math.min(20, s.loyaltyPoints / 50);
    return Math.max(0, Math.min(100, score));
  }

  // ─── AI Diet Plan generator (rule-based, no LLM call) ───
  async generateDietPlan(
    userId: string,
    dto: {
      goal: 'weight_loss' | 'maintenance' | 'muscle_gain';
      weightKg: number;
      heightCm?: number;
      ageYears?: number;
      gender?: 'male' | 'female';
      activityLevel?: 'sedentary' | 'light' | 'moderate' | 'high';
      allergies?: string[];
    },
  ) {
    const weight = Number(dto.weightKg);
    const bmr =
      dto.gender === 'female'
        ? 10 * weight + 6.25 * (dto.heightCm ?? 165) - 5 * (dto.ageYears ?? 30) - 161
        : 10 * weight + 6.25 * (dto.heightCm ?? 175) - 5 * (dto.ageYears ?? 30) + 5;
    const activityMul = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 }[
      dto.activityLevel ?? 'moderate'
    ];
    const tdee = Math.round(bmr * activityMul);
    const calories =
      dto.goal === 'weight_loss' ? tdee - 400 : dto.goal === 'muscle_gain' ? tdee + 300 : tdee;
    const proteinG = Math.round(weight * (dto.goal === 'muscle_gain' ? 2.0 : 1.8));
    const fatG = Math.round((calories * 0.25) / 9);
    const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);

    const allergies = (dto.allergies ?? []).map((a) => a.toLowerCase());
    const has = (term: string) => allergies.some((a) => a.includes(term));

    const meals = {
      breakfast: has('egg')
        ? 'Oatmeal with banana, almonds & honey'
        : 'Scrambled eggs, whole-grain toast, fruit',
      snack1: has('nut') ? 'Greek yogurt with berries' : 'Mixed nuts & apple',
      lunch: has('chicken') ? 'Salmon, quinoa, mixed veggies' : 'Grilled chicken, brown rice, salad',
      snack2: has('dairy') ? 'Hummus & vegetable sticks' : 'Cottage cheese with pineapple',
      dinner: has('fish') ? 'Lean beef stir-fry with vegetables' : 'Baked white fish, sweet potato, broccoli',
    };

    const plan = {
      summary: `${dto.goal.replace('_', ' ')} plan at ~${calories} kcal/day`,
      macros: { calories, proteinG, carbsG, fatG },
      meals,
      hydration: `${Math.round(weight * 35)} ml water per day`,
      notes: [
        'Eat protein with every meal.',
        'Spread carbs around training sessions.',
        'Keep added sugar low; prefer whole foods.',
      ],
    };

    return this.prisma.aiDietPlan.create({
      data: {
        userId,
        goal: dto.goal,
        calories,
        proteinG,
        carbsG,
        fatG,
        allergies: dto.allergies ?? [],
        plan: plan as any,
      },
    });
  }

  myDietPlans(userId: string) {
    return this.prisma.aiDietPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
