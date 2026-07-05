import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceMethod } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(dto: {
    userId?: string;
    qrCode?: string;
    rfidTag?: string;
    query?: string; // name, email, or member number search
    gymId?: string;
    branchId: string;
    method: AttendanceMethod;
  }) {
    let userId = dto.userId;

    // Resolve by QR or RFID
    if (!userId && dto.qrCode) {
      const profile = await this.prisma.memberProfile.findFirst({
        where: { OR: [{ qrCode: dto.qrCode }, { memberNumber: dto.qrCode }] },
      });
      if (!profile) throw new BadRequestException('Invalid QR code');
      userId = profile.userId;
    }
    if (!userId && dto.rfidTag) {
      const profile = await this.prisma.memberProfile.findUnique({ where: { rfidTag: dto.rfidTag } });
      if (!profile) throw new BadRequestException('Invalid RFID');
      userId = profile.userId;
    }
    // Resolve by free-text query (name or email)
    if (!userId && dto.query) {
      const q = dto.query.trim();
      const nameParts = q.split(/\s+/).filter(Boolean);
      const firstNameTerm = nameParts[0];
      const lastNameTerm = nameParts.length > 1 ? nameParts[nameParts.length - 1] : undefined;
      // Try QR/member number first
      const byQr = await this.prisma.memberProfile.findFirst({
        where: { OR: [{ qrCode: q }, { memberNumber: q }] },
      });
      if (byQr) {
        userId = byQr.userId;
      } else {
        // Search by email or name
        const user = await this.prisma.user.findFirst({
          where: {
            gymId: dto.gymId,
            role: 'MEMBER',
            OR: [
              { email: { equals: q } },
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              ...(lastNameTerm
                ? [
                    {
                      AND: [
                        { firstName: { contains: firstNameTerm } },
                        { lastName: { contains: lastNameTerm } },
                      ],
                    },
                    {
                      AND: [
                        { firstName: { contains: lastNameTerm } },
                        { lastName: { contains: firstNameTerm } },
                      ],
                    },
                  ]
                : []),
            ],
          },
        });
        if (!user) throw new BadRequestException('Member not found');
        userId = user.id;
      }
    }
    if (!userId) throw new BadRequestException('Member identifier required');

    // Verify active membership
    const membership = await this.prisma.membership.findFirst({
      where: { memberId: userId, status: 'ACTIVE' },
    });
    if (!membership) throw new BadRequestException('No active membership');

    // Prevent double check-in
    const existing = await this.prisma.attendance.findFirst({
      where: { userId, checkedOutAt: null },
    });
    if (existing) throw new BadRequestException('Member is already checked in');

    return this.prisma.attendance.create({
      data: { userId, branchId: dto.branchId, method: dto.method },
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  async checkOut(attendanceId: string) {
    const record = await this.prisma.attendance.findUnique({ where: { id: attendanceId } });
    if (!record) throw new BadRequestException('Attendance record not found');
    if (record.checkedOutAt) throw new BadRequestException('Already checked out');

    const now = new Date();
    const durationMin = Math.round((now.getTime() - record.checkedInAt.getTime()) / 60000);

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { checkedOutAt: now, durationMin },
    });
  }

  async getFirstBranch(gymId: string) {
    return this.prisma.branch.findFirst({ where: { gymId }, orderBy: { createdAt: 'asc' } });
  }

  async getCurrentOccupancy(branchId: string) {
    const count = await this.prisma.attendance.count({
      where: { branchId, checkedOutAt: null },
    });
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    return {
      current: count,
      capacity: branch?.capacity ?? 0,
      percentage: branch ? Math.round((count / branch.capacity) * 100) : 0,
    };
  }

  async getAttendanceReport(gymId: string, from: Date, to: Date) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        branch: { gymId },
        checkedInAt: { gte: fromDate, lte: toDate },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        branch: { select: { name: true } },
      },
      orderBy: { checkedInAt: 'desc' },
    });
  }
}
