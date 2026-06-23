import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';
import { AccessResult, AttendanceMethod, MembershipStatus } from '@prisma/client';

@Injectable()
export class AccessService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  /** Validate a QR scan and (if allowed) create an Attendance row. */
  async scan(opts: {
    qrCode: string;
    gymId?: string | null;
    branchId?: string | null;
    direction?: 'IN' | 'OUT';
    deviceId?: string;
    overrideBy?: string | null;
    ipAddress?: string;
  }) {
    const direction = opts.direction ?? 'IN';
    const member = await this.prisma.memberProfile.findUnique({
      where: { qrCode: opts.qrCode },
      include: { user: { include: { memberships: { include: { plan: true } } } } },
    });

    const logCommon = {
      branchId: opts.branchId ?? null,
      gymId: opts.gymId ?? null,
      qrCode: opts.qrCode,
      direction,
      device: opts.deviceId ?? null,
      ipAddress: opts.ipAddress ?? null,
      overrideBy: opts.overrideBy ?? null,
    };

    if (!member) {
      return this.deny(logCommon, null, 'unknown_qr');
    }
    const user = member.user;
    if (!user.isActive) return this.deny(logCommon, user.id, 'inactive_user');
    if (user.gymId && opts.gymId && user.gymId !== opts.gymId) {
      return this.deny(logCommon, user.id, 'wrong_gym');
    }

    const now = new Date();
    const activeMembership = user.memberships.find(
      (m) =>
        m.status === MembershipStatus.ACTIVE &&
        m.startDate <= now &&
        m.endDate >= now,
    );
    const frozen = user.memberships.some((m) => m.status === MembershipStatus.FROZEN);

    const allowedReason =
      activeMembership ? null : frozen ? 'frozen' : 'no_active_membership';
    if (allowedReason && !opts.overrideBy) {
      return this.deny(logCommon, user.id, allowedReason);
    }

    // Anti-passback: prevent IN twice in a row for same user within window.
    if (direction === 'IN') {
      const open = await this.prisma.attendance.findFirst({
        where: { userId: user.id, checkedOutAt: null },
        orderBy: { checkedInAt: 'desc' },
      });
      if (open && now.getTime() - open.checkedInAt.getTime() < 60_000) {
        return this.deny(logCommon, user.id, 'anti_passback');
      }
    }

    // Branch resolution
    const branchId =
      opts.branchId ??
      (user.branchId ?? (await this.firstBranchOfGym(user.gymId ?? opts.gymId)));
    if (!branchId) return this.deny(logCommon, user.id, 'no_branch');

    let attendance;
    if (direction === 'IN') {
      attendance = await this.prisma.attendance.create({
        data: {
          userId: user.id,
          branchId,
          method: AttendanceMethod.QR_CODE,
          notes: opts.overrideBy ? `override:${opts.overrideBy}` : null,
        },
      });
    } else {
      const open = await this.prisma.attendance.findFirst({
        where: { userId: user.id, checkedOutAt: null },
        orderBy: { checkedInAt: 'desc' },
      });
      if (!open) return this.deny(logCommon, user.id, 'not_checked_in');
      const checkedOutAt = new Date();
      const minutes = Math.round((checkedOutAt.getTime() - open.checkedInAt.getTime()) / 60000);
      attendance = await this.prisma.attendance.update({
        where: { id: open.id },
        data: { checkedOutAt, durationMin: minutes },
      });
    }

    await this.prisma.accessLog.create({
      data: {
        ...logCommon,
        userId: user.id,
        result: opts.overrideBy ? AccessResult.OVERRIDE : AccessResult.ALLOWED,
        reason: allowedReason ?? null,
      },
    });

    await this.events.emit(
      direction === 'IN' ? APP_EVENTS.MEMBER_CHECKED_IN : APP_EVENTS.MEMBER_CHECKED_OUT,
      { userId: user.id, gymId: user.gymId, meta: { branchId, attendanceId: attendance.id } },
    );

    return {
      allowed: true,
      direction,
      attendance,
      member: { id: user.id, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl },
    };
  }

  private async firstBranchOfGym(gymId?: string | null): Promise<string | null> {
    if (!gymId) return null;
    const b = await this.prisma.branch.findFirst({ where: { gymId, isActive: true } });
    return b?.id ?? null;
  }

  private async deny(common: any, userId: string | null, reason: string) {
    await this.prisma.accessLog.create({
      data: { ...common, userId, result: AccessResult.DENIED, reason },
    });
    await this.events.emit(APP_EVENTS.ACCESS_DENIED, {
      userId: userId ?? undefined,
      gymId: common.gymId,
      meta: { reason, branchId: common.branchId },
    });
    return { allowed: false, reason };
  }

  /** Returns the QR string for a member; rotates if requested. */
  async myQrCode(userId: string, rotate = false) {
    const profile = await this.prisma.memberProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestException('Not a member');
    if (!rotate) return { qrCode: profile.qrCode };
    const fresh = `QR-${profile.memberNumber}-${Date.now().toString(36)}`;
    const updated = await this.prisma.memberProfile.update({
      where: { userId },
      data: { qrCode: fresh },
    });
    return { qrCode: updated.qrCode };
  }

  listLogs(gymId: string, take = 100) {
    return this.prisma.accessLog.findMany({
      where: { gymId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: Math.min(take, 500),
    });
  }
}
