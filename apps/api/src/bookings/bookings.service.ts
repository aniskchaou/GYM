import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async bookClass(memberId: string, scheduleId: string) {
    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: { bookings: { where: { status: { in: ['CONFIRMED', 'WAITLISTED'] } } } },
    });
    if (!schedule) throw new NotFoundException('Class schedule not found');
    if (schedule.status !== 'SCHEDULED') throw new BadRequestException('Class is not available for booking');

    // Check duplicate booking
    const existing = await this.prisma.booking.findUnique({
      where: { memberId_scheduleId: { memberId, scheduleId } },
    });
    if (existing && existing.status !== 'CANCELLED') throw new BadRequestException('Already booked');

    const confirmedCount = schedule.bookings.filter(b => b.status === 'CONFIRMED').length;
    const isWaitlisted = confirmedCount >= schedule.maxCapacity;
    const waitlistPos = isWaitlisted
      ? schedule.bookings.filter(b => b.status === 'WAITLISTED').length + 1
      : null;

    return this.prisma.booking.upsert({
      where: { memberId_scheduleId: { memberId, scheduleId } },
      create: {
        memberId,
        scheduleId,
        status: isWaitlisted ? 'WAITLISTED' : 'CONFIRMED',
        waitlistPos,
      },
      update: {
        status: isWaitlisted ? 'WAITLISTED' : 'CONFIRMED',
        waitlistPos,
        cancelledAt: null,
      },
      include: { schedule: { include: { gymClass: true, trainer: true } } },
    });
  }

  async cancelBooking(memberId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, memberId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'CANCELLED') throw new BadRequestException('Booking already cancelled');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    // Promote waitlisted member if a confirmed spot freed
    if (booking.status === 'CONFIRMED') {
      const nextWaitlisted = await this.prisma.booking.findFirst({
        where: { scheduleId: booking.scheduleId, status: 'WAITLISTED' },
        orderBy: { waitlistPos: 'asc' },
      });
      if (nextWaitlisted) {
        await this.prisma.booking.update({
          where: { id: nextWaitlisted.id },
          data: { status: 'CONFIRMED', waitlistPos: null },
        });
      }
    }

    return updated;
  }

  async getUpcomingClasses(gymId: string) {
    return this.prisma.classSchedule.findMany({
      where: {
        branch: { gymId },
        status: 'SCHEDULED',
        startTime: { gte: new Date() },
      },
      include: {
        gymClass: true,
        trainer: { select: { firstName: true, lastName: true, avatarUrl: true } },
        bookings: { where: { status: { in: ['CONFIRMED'] } } },
      },
      orderBy: { startTime: 'asc' },
      take: 50,
    });
  }

  async getMemberBookings(memberId: string) {
    return this.prisma.booking.findMany({
      where: { memberId },
      include: { schedule: { include: { gymClass: true, trainer: true, branch: true } } },
      orderBy: { bookedAt: 'desc' },
    });
  }
}
