import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

@Injectable()
export class GymEventsService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  list(gymId: string) {
    return this.prisma.gymEvent.findMany({
      where: { gymId },
      orderBy: { startTime: 'asc' },
      include: { _count: { select: { registrations: true } } },
    });
  }

  get(gymId: string, id: string) {
    return this.prisma.gymEvent.findFirst({
      where: { id, gymId },
      include: {
        registrations: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
  }

  create(gymId: string, dto: any) {
    return this.prisma.gymEvent.create({
      data: {
        gymId,
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category ?? null,
        location: dto.location ?? null,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        capacity: Number(dto.capacity ?? 50),
        price: Number(dto.price ?? 0),
        imageUrl: dto.imageUrl ?? null,
        status: dto.status ?? EventStatus.REGISTRATION_OPEN,
      },
    });
  }

  async update(gymId: string, id: string, dto: any) {
    const e = await this.prisma.gymEvent.findFirst({ where: { id, gymId } });
    if (!e) throw new NotFoundException('Event not found');
    return this.prisma.gymEvent.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
        ...(dto.capacity !== undefined && { capacity: Number(dto.capacity) }),
        ...(dto.price !== undefined && { price: Number(dto.price) }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(gymId: string, id: string) {
    const e = await this.prisma.gymEvent.findFirst({ where: { id, gymId } });
    if (!e) throw new NotFoundException('Event not found');
    await this.prisma.eventRegistration.deleteMany({ where: { eventId: id } });
    await this.prisma.gymEvent.delete({ where: { id } });
    return { success: true };
  }

  async register(gymId: string, userId: string, eventId: string) {
    const event = await this.prisma.gymEvent.findFirst({ where: { id: eventId, gymId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== EventStatus.REGISTRATION_OPEN) throw new BadRequestException('Registration closed');
    const count = await this.prisma.eventRegistration.count({
      where: { eventId, cancelledAt: null },
    });
    if (count >= event.capacity) throw new BadRequestException('Event is full');

    const qrCode = `EVT-${eventId.slice(-6)}-${randomBytes(4).toString('hex')}`;
    try {
      const reg = await this.prisma.eventRegistration.create({
        data: { eventId, userId, qrCode },
      });
      await this.events.emit(APP_EVENTS.EVENT_REGISTERED, {
        userId,
        gymId,
        meta: { eventId },
      });
      return reg;
    } catch {
      throw new BadRequestException('Already registered');
    }
  }

  async cancelRegistration(userId: string, eventId: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!reg || reg.cancelledAt) throw new NotFoundException('Registration not found');
    return this.prisma.eventRegistration.update({
      where: { eventId_userId: { eventId, userId } },
      data: { cancelledAt: new Date() },
    });
  }

  /** Staff scans event-registration QR for check-in. */
  async checkInQr(gymId: string, qrCode: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { qrCode },
      include: { event: true, user: true },
    });
    if (!reg) throw new NotFoundException('Invalid QR');
    if (reg.event.gymId !== gymId) throw new BadRequestException('Wrong gym');
    if (reg.cancelledAt) throw new BadRequestException('Registration cancelled');
    if (reg.attended) return { alreadyAttended: true, registration: reg };
    const updated = await this.prisma.eventRegistration.update({
      where: { id: reg.id },
      data: { attended: true, attendedAt: new Date() },
    });
    await this.events.emit(APP_EVENTS.EVENT_ATTENDED, {
      userId: reg.userId,
      gymId,
      meta: { eventId: reg.eventId },
    });
    return { registration: updated, user: reg.user };
  }

  myRegistrations(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId, cancelledAt: null },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Cron: close registration for events that already started. */
  async closeExpired() {
    const now = new Date();
    const res = await this.prisma.gymEvent.updateMany({
      where: { status: EventStatus.REGISTRATION_OPEN, startTime: { lt: now } },
      data: { status: EventStatus.REGISTRATION_CLOSED },
    });
    return { closed: res.count };
  }
}
