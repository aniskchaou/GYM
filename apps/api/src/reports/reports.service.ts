import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardKpis(gymId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      todayCheckIns,
      upcomingClasses,
    ] = await Promise.all([
      this.prisma.user.count({ where: { gymId, role: 'MEMBER' } }),
      this.prisma.membership.count({ where: { member: { gymId }, status: 'ACTIVE' } }),
      this.prisma.user.count({
        where: { gymId, role: 'MEMBER', createdAt: { gte: startOfMonth } },
      }),
      this.prisma.payment.aggregate({
        where: { user: { gymId }, status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { user: { gymId }, status: 'PAID', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          user: { gymId },
          status: 'PAID',
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.attendance.count({
        where: {
          branch: { gymId },
          checkedInAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.classSchedule.count({
        where: {
          branch: { gymId },
          status: 'SCHEDULED',
          startTime: { gte: new Date() },
        },
      }),
    ]);

    const thisMonthRev = revenueThisMonth._sum.amount || 0;
    const lastMonthRev = revenueLastMonth._sum.amount || 0;
    const revenueGrowth = lastMonthRev
      ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
      : 0;

    return {
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      churnRate: totalMembers > 0 ? Math.round(((totalMembers - activeMembers) / totalMembers) * 100) : 0,
      totalRevenue: totalRevenue._sum.amount || 0,
      revenueThisMonth: thisMonthRev,
      revenueGrowth,
      todayCheckIns,
      upcomingClasses,
    };
  }

  async getRevenueChart(gymId: string, months = 6) {
    const results = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const agg = await this.prisma.payment.aggregate({
        where: {
          user: { gymId },
          status: 'PAID',
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: true,
      });
      results.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: agg._sum.amount || 0,
        transactions: agg._count,
      });
    }
    return results;
  }

  async getMemberGrowthChart(gymId: string, months = 6) {
    const results = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await this.prisma.user.count({
        where: { gymId, role: 'MEMBER', createdAt: { lte: end } },
      });
      results.push({
        month: end.toLocaleString('default', { month: 'short', year: 'numeric' }),
        members: count,
      });
    }
    return results;
  }

  async getAttendanceHeatmap(gymId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const records = await this.prisma.attendance.findMany({
      where: { branch: { gymId }, checkedInAt: { gte: sevenDaysAgo } },
      select: { checkedInAt: true },
    });

    const heatmap: Record<string, Record<number, number>> = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const r of records) {
      const day = days[r.checkedInAt.getDay()];
      const hour = r.checkedInAt.getHours();
      if (!heatmap[day]) heatmap[day] = {};
      heatmap[day][hour] = (heatmap[day][hour] || 0) + 1;
    }
    return heatmap;
  }

  async getTopClasses(gymId: string, limit = 10) {
    return this.prisma.booking.groupBy({
      by: ['scheduleId'],
      where: {
        schedule: { branch: { gymId } },
        status: { in: ['CONFIRMED', 'ATTENDED'] },
      },
      _count: { scheduleId: true },
      orderBy: { _count: { scheduleId: 'desc' } },
      take: limit,
    });
  }
}
