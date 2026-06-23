import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

function generateCode(): string {
  return `GC-${randomBytes(5).toString('hex').toUpperCase()}`;
}

@Injectable()
export class GiftCardsService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  list(gymId: string) {
    return this.prisma.giftCard.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        purchaser: { select: { id: true, firstName: true, lastName: true } },
        recipient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async get(gymId: string, id: string) {
    const card = await this.prisma.giftCard.findFirst({
      where: { id, gymId },
      include: { transactions: { orderBy: { createdAt: 'desc' } } },
    });
    if (!card) throw new NotFoundException('Gift card not found');
    return card;
  }

  async lookupByCode(gymId: string, code: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { code } });
    if (!card || card.gymId !== gymId) throw new NotFoundException('Invalid code');
    return card;
  }

  async purchase(
    gymId: string,
    purchaserId: string,
    dto: {
      amount: number;
      currency?: string;
      recipientId?: string;
      recipientEmail?: string;
      message?: string;
      expiresAt?: string;
      campaign?: string;
    },
  ) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new BadRequestException('Invalid amount');
    let code = generateCode();
    // ensure unique
    for (let i = 0; i < 5; i++) {
      const exists = await this.prisma.giftCard.findUnique({ where: { code } });
      if (!exists) break;
      code = generateCode();
    }
    const card = await this.prisma.giftCard.create({
      data: {
        gymId,
        code,
        amount,
        balance: amount,
        currency: dto.currency ?? 'EUR',
        status: GiftCardStatus.ACTIVE,
        purchaserId,
        recipientId: dto.recipientId ?? null,
        recipientEmail: dto.recipientEmail ?? null,
        message: dto.message ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        campaign: dto.campaign ?? null,
      },
    });
    await this.prisma.giftCardTransaction.create({
      data: { cardId: card.id, userId: purchaserId, amount, reference: 'purchase' },
    });
    await this.events.emit(APP_EVENTS.GIFT_CARD_ISSUED, {
      userId: purchaserId,
      gymId,
      meta: { cardId: card.id, code, amount },
    });
    return card;
  }

  async redeem(
    gymId: string,
    userId: string,
    dto: { code: string; amount: number; reference?: string },
  ) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new BadRequestException('Invalid amount');
    const card = await this.prisma.giftCard.findUnique({ where: { code: dto.code } });
    if (!card || card.gymId !== gymId) throw new NotFoundException('Invalid code');
    if (card.status !== GiftCardStatus.ACTIVE) throw new BadRequestException('Card not active');
    if (card.expiresAt && card.expiresAt < new Date()) {
      await this.prisma.giftCard.update({ where: { id: card.id }, data: { status: GiftCardStatus.EXPIRED } });
      throw new BadRequestException('Card expired');
    }
    if (card.balance < amount) throw new BadRequestException('Insufficient balance');

    const newBalance = card.balance - amount;
    const newStatus = newBalance <= 0 ? GiftCardStatus.REDEEMED : GiftCardStatus.ACTIVE;
    const [updated, txn] = await this.prisma.$transaction([
      this.prisma.giftCard.update({
        where: { id: card.id },
        data: { balance: newBalance, status: newStatus },
      }),
      this.prisma.giftCardTransaction.create({
        data: { cardId: card.id, userId, amount: -amount, reference: dto.reference ?? 'redeem' },
      }),
    ]);
    await this.events.emit(APP_EVENTS.GIFT_CARD_REDEEMED, {
      userId,
      gymId,
      meta: { cardId: card.id, amount, balance: newBalance },
    });
    return { card: updated, txn };
  }

  async cancel(gymId: string, id: string) {
    const card = await this.prisma.giftCard.findFirst({ where: { id, gymId } });
    if (!card) throw new NotFoundException('Gift card not found');
    return this.prisma.giftCard.update({
      where: { id },
      data: { status: GiftCardStatus.CANCELLED },
    });
  }

  myCards(userId: string) {
    return this.prisma.giftCard.findMany({
      where: { OR: [{ purchaserId: userId }, { recipientId: userId }] },
      orderBy: { createdAt: 'desc' },
    });
  }
}
