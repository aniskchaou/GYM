import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LockerStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

@Injectable()
export class LockersService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  list(gymId: string) {
    return this.prisma.locker.findMany({
      where: { gymId },
      orderBy: [{ zone: 'asc' }, { code: 'asc' }],
      include: { bookings: { where: { releasedAt: null }, include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
    });
  }

  create(gymId: string, dto: any) {
    return this.prisma.locker.create({
      data: {
        gymId,
        branchId: dto.branchId ?? null,
        code: dto.code,
        zone: dto.zone ?? null,
        size: dto.size ?? null,
        hasBluetooth: !!dto.hasBluetooth,
        hasNfc: !!dto.hasNfc,
        notes: dto.notes ?? null,
      },
    });
  }

  async update(gymId: string, id: string, dto: any) {
    const existing = await this.prisma.locker.findFirst({ where: { id, gymId } });
    if (!existing) throw new NotFoundException('Locker not found');
    return this.prisma.locker.update({
      where: { id },
      data: {
        ...(dto.zone !== undefined && { zone: dto.zone }),
        ...(dto.size !== undefined && { size: dto.size }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.hasBluetooth !== undefined && { hasBluetooth: !!dto.hasBluetooth }),
        ...(dto.hasNfc !== undefined && { hasNfc: !!dto.hasNfc }),
      },
    });
  }

  async remove(gymId: string, id: string) {
    const existing = await this.prisma.locker.findFirst({ where: { id, gymId } });
    if (!existing) throw new NotFoundException('Locker not found');
    await this.prisma.locker.delete({ where: { id } });
    return { success: true };
  }

  /** Book a specific locker (or auto-assign if not provided). */
  async book(gymId: string, userId: string, dto: { lockerId?: string; expectedMinutes?: number }) {
    // Prevent double-booking from same user
    const open = await this.prisma.lockerBooking.findFirst({
      where: { userId, releasedAt: null },
    });
    if (open) throw new BadRequestException('You already have an active locker');

    let locker;
    if (dto.lockerId) {
      locker = await this.prisma.locker.findFirst({
        where: { id: dto.lockerId, gymId, status: LockerStatus.AVAILABLE },
      });
      if (!locker) throw new BadRequestException('Locker not available');
    } else {
      locker = await this.prisma.locker.findFirst({
        where: { gymId, status: LockerStatus.AVAILABLE },
        orderBy: { code: 'asc' },
      });
      if (!locker) throw new BadRequestException('No lockers available');
    }

    const unlockToken = randomBytes(8).toString('hex');
    const expectedEnd = dto.expectedMinutes
      ? new Date(Date.now() + dto.expectedMinutes * 60_000)
      : null;

    const [booking] = await this.prisma.$transaction([
      this.prisma.lockerBooking.create({
        data: { lockerId: locker.id, userId, expectedEnd, unlockToken },
      }),
      this.prisma.locker.update({ where: { id: locker.id }, data: { status: LockerStatus.OCCUPIED } }),
    ]);

    await this.events.emit(APP_EVENTS.LOCKER_ASSIGNED, {
      userId,
      gymId,
      meta: { lockerId: locker.id, code: locker.code },
    });
    return { booking, unlockToken, locker };
  }

  async release(gymId: string, userId: string, bookingId: string) {
    const booking = await this.prisma.lockerBooking.findFirst({
      where: { id: bookingId, userId, releasedAt: null },
      include: { locker: true },
    });
    if (!booking) throw new NotFoundException('Booking not found or already released');
    if (booking.locker.gymId !== gymId) throw new NotFoundException('Booking not in this gym');
    await this.prisma.$transaction([
      this.prisma.lockerBooking.update({
        where: { id: bookingId },
        data: { releasedAt: new Date(), unlockToken: null },
      }),
      this.prisma.locker.update({
        where: { id: booking.lockerId },
        data: { status: LockerStatus.AVAILABLE },
      }),
    ]);
    await this.events.emit(APP_EVENTS.LOCKER_RELEASED, {
      userId,
      gymId,
      meta: { lockerId: booking.lockerId },
    });
    return { success: true };
  }

  /** Validate the unlock token presented by mobile app via QR/Bluetooth/NFC. */
  async unlock(payload: { lockerId: string; token: string }) {
    const booking = await this.prisma.lockerBooking.findFirst({
      where: { lockerId: payload.lockerId, releasedAt: null, unlockToken: payload.token },
    });
    if (!booking) throw new BadRequestException('Invalid unlock token');
    return { unlocked: true, bookingId: booking.id };
  }

  /** Cron-ready: lockers held past expectedEnd by 30+ minutes are flagged abandoned and released. */
  async sweepAbandoned(gymId?: string) {
    const cutoff = new Date(Date.now() - 30 * 60_000);
    const rows = await this.prisma.lockerBooking.findMany({
      where: {
        releasedAt: null,
        expectedEnd: { lt: cutoff },
        ...(gymId ? { locker: { gymId } } : {}),
      },
      include: { locker: true },
    });
    for (const b of rows) {
      await this.prisma.$transaction([
        this.prisma.lockerBooking.update({
          where: { id: b.id },
          data: { releasedAt: new Date(), abandoned: true, unlockToken: null },
        }),
        this.prisma.locker.update({ where: { id: b.lockerId }, data: { status: LockerStatus.AVAILABLE } }),
      ]);
    }
    return { released: rows.length };
  }

  myBookings(userId: string) {
    return this.prisma.lockerBooking.findMany({
      where: { userId },
      include: { locker: true },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }
}
