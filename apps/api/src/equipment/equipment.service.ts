import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EquipmentBookingStatus, EquipmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  // ─── Equipment CRUD ───
  list(gymId: string) {
    return this.prisma.equipment.findMany({ where: { gymId }, orderBy: { name: 'asc' } });
  }

  create(gymId: string, dto: any) {
    return this.prisma.equipment.create({
      data: {
        gymId,
        branchId: dto.branchId ?? null,
        name: dto.name,
        category: dto.category ?? 'machine',
        code: dto.code ?? null,
        slotMinutes: Number(dto.slotMinutes ?? 30),
        imageUrl: dto.imageUrl ?? null,
        notes: dto.notes ?? null,
      },
    });
  }

  async update(gymId: string, id: string, dto: any) {
    const e = await this.prisma.equipment.findFirst({ where: { id, gymId } });
    if (!e) throw new NotFoundException('Equipment not found');
    return this.prisma.equipment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.slotMinutes !== undefined && { slotMinutes: Number(dto.slotMinutes) }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(gymId: string, id: string) {
    const e = await this.prisma.equipment.findFirst({ where: { id, gymId } });
    if (!e) throw new NotFoundException('Equipment not found');
    await this.prisma.equipment.delete({ where: { id } });
    return { success: true };
  }

  async setMaintenance(gymId: string, id: string, on: boolean) {
    const e = await this.prisma.equipment.findFirst({ where: { id, gymId } });
    if (!e) throw new NotFoundException('Equipment not found');
    return this.prisma.equipment.update({
      where: { id },
      data: { status: on ? EquipmentStatus.MAINTENANCE : EquipmentStatus.AVAILABLE },
    });
  }

  // ─── Bookings ───
  listBookings(gymId: string, equipmentId?: string) {
    return this.prisma.equipmentBooking.findMany({
      where: {
        equipment: { gymId },
        ...(equipmentId ? { equipmentId } : {}),
      },
      include: {
        equipment: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 200,
    });
  }

  async book(gymId: string, userId: string, dto: { equipmentId: string; startTime: string; durationMinutes?: number }) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { id: dto.equipmentId, gymId },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');
    if (equipment.status === EquipmentStatus.MAINTENANCE) {
      throw new BadRequestException('Equipment under maintenance');
    }

    const startTime = new Date(dto.startTime);
    const duration = Number(dto.durationMinutes ?? equipment.slotMinutes);
    const endTime = new Date(startTime.getTime() + duration * 60_000);

    // Prevent overlap (CONFIRMED bookings)
    const overlap = await this.prisma.equipmentBooking.findFirst({
      where: {
        equipmentId: equipment.id,
        status: { in: [EquipmentBookingStatus.CONFIRMED, EquipmentBookingStatus.PENDING] },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    let status: EquipmentBookingStatus = EquipmentBookingStatus.CONFIRMED;
    if (overlap) {
      status = EquipmentBookingStatus.WAITLISTED;
    }

    const booking = await this.prisma.equipmentBooking.create({
      data: {
        equipmentId: equipment.id,
        userId,
        startTime,
        endTime,
        status,
      },
    });

    if (status === EquipmentBookingStatus.CONFIRMED) {
      await this.events.emit(APP_EVENTS.EQUIPMENT_BOOKED, {
        userId,
        gymId,
        meta: { equipmentId: equipment.id, startTime, endTime },
      });
    }
    return booking;
  }

  async cancel(gymId: string, userId: string, id: string) {
    const b = await this.prisma.equipmentBooking.findFirst({
      where: { id, userId, equipment: { gymId } },
    });
    if (!b) throw new NotFoundException('Booking not found');
    const updated = await this.prisma.equipmentBooking.update({
      where: { id },
      data: { status: EquipmentBookingStatus.CANCELLED },
    });
    // Promote next waitlisted booking if any overlap with this slot
    const next = await this.prisma.equipmentBooking.findFirst({
      where: {
        equipmentId: b.equipmentId,
        status: EquipmentBookingStatus.WAITLISTED,
        AND: [{ startTime: { lt: b.endTime } }, { endTime: { gt: b.startTime } }],
      },
      orderBy: { createdAt: 'asc' },
    });
    if (next) {
      await this.prisma.equipmentBooking.update({
        where: { id: next.id },
        data: { status: EquipmentBookingStatus.CONFIRMED },
      });
      await this.events.emit(APP_EVENTS.EQUIPMENT_BOOKED, {
        userId: next.userId,
        gymId,
        meta: { equipmentId: next.equipmentId, promotedFromWaitlist: true },
      });
    }
    return updated;
  }

  myBookings(userId: string) {
    return this.prisma.equipmentBooking.findMany({
      where: { userId, status: { not: EquipmentBookingStatus.CANCELLED } },
      include: { equipment: true },
      orderBy: { startTime: 'desc' },
      take: 30,
    });
  }

  /** Auto-release idle bookings — anything CONFIRMED that ended >15 min ago becomes COMPLETED. */
  async releaseIdle() {
    const cutoff = new Date(Date.now() - 15 * 60_000);
    const rows = await this.prisma.equipmentBooking.updateMany({
      where: {
        status: EquipmentBookingStatus.CONFIRMED,
        endTime: { lt: cutoff },
      },
      data: { status: EquipmentBookingStatus.COMPLETED },
    });
    return { completed: rows.count };
  }
}
