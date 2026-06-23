import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  list(gymId: string) {
    return this.prisma.coupon.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(gymId: string, dto: {
    code: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    maxUses?: number;
    validUntil?: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        gymId,
        code: dto.code.toUpperCase().trim(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxUses: dto.maxUses ?? null,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
    });
  }

  async update(gymId: string, id: string, dto: any) {
    const existing = await this.prisma.coupon.findFirst({ where: { id, gymId } });
    if (!existing) throw new NotFoundException('Coupon not found');
    const data: any = {};
    if (dto.code !== undefined) data.code = dto.code.toUpperCase().trim();
    if (dto.discountType !== undefined) data.discountType = dto.discountType;
    if (dto.discountValue !== undefined) data.discountValue = dto.discountValue;
    if (dto.maxUses !== undefined) data.maxUses = dto.maxUses;
    if (dto.validUntil !== undefined) data.validUntil = dto.validUntil ? new Date(dto.validUntil) : null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async remove(gymId: string, id: string) {
    const existing = await this.prisma.coupon.findFirst({ where: { id, gymId } });
    if (!existing) throw new NotFoundException('Coupon not found');
    await this.prisma.coupon.delete({ where: { id } });
    return { success: true };
  }

  /** Validate and return discount math for the supplied price. Does NOT increment usage. */
  async validate(gymId: string, code: string, amount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { gymId_code: { gymId, code: code.toUpperCase().trim() } },
    });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Invalid coupon');
    const now = new Date();
    if (coupon.validFrom > now) throw new BadRequestException('Coupon not yet valid');
    if (coupon.validUntil && coupon.validUntil < now) throw new BadRequestException('Coupon expired');
    if (coupon.maxUses != null && coupon.currentUses >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    const discount = coupon.discountType === 'PERCENT'
      ? Math.round((amount * coupon.discountValue) / 100 * 100) / 100
      : coupon.discountValue;
    const finalPrice = Math.max(0, amount - discount);
    return { coupon, discount, finalPrice };
  }

  /** Apply (increment usage). Call after a successful payment/membership creation. */
  redeem(id: string) {
    return this.prisma.coupon.update({
      where: { id },
      data: { currentUses: { increment: 1 } },
    });
  }
}
