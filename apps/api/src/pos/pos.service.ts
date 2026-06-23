import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}

  // ────────── PRODUCTS ──────────
  listProducts(gymId: string) {
    return this.prisma.product.findMany({
      where: { gymId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  createProduct(gymId: string, dto: any) {
    return this.prisma.product.create({
      data: {
        gymId,
        name: dto.name,
        category: dto.category ?? 'general',
        description: dto.description,
        price: Number(dto.price),
        currency: dto.currency ?? 'EUR',
        stock: Number(dto.stock ?? 0),
        sku: dto.sku ?? null,
        imageUrl: dto.imageUrl ?? null,
      },
    });
  }

  async updateProduct(gymId: string, id: string, dto: any) {
    const existing = await this.prisma.product.findFirst({ where: { id, gymId } });
    if (!existing) throw new NotFoundException('Product not found');
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: Number(dto.price) }),
        ...(dto.stock !== undefined && { stock: Number(dto.stock) }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async removeProduct(gymId: string, id: string) {
    const existing = await this.prisma.product.findFirst({ where: { id, gymId } });
    if (!existing) throw new NotFoundException('Product not found');
    await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }

  // ────────── ORDERS ──────────
  listOrders(gymId: string) {
    return this.prisma.order.findMany({
      where: { items: { some: { product: { gymId } } } },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  /** Create an order with given items; decrements stock; records a Payment row tied to the customer. */
  async createOrder(gymId: string, dto: {
    customerId: string;
    items: Array<{ productId: string; quantity: number }>;
    method?: PaymentMethod;
  }) {
    if (!dto.items?.length) throw new BadRequestException('Order must include at least one item');
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map(i => i.productId) }, gymId },
    });
    if (products.length !== dto.items.length) throw new BadRequestException('Some products not found');

    let total = 0;
    for (const it of dto.items) {
      const p = products.find(pp => pp.id === it.productId)!;
      if (p.stock < it.quantity) throw new BadRequestException(`Insufficient stock for ${p.name}`);
      total += p.price * it.quantity;
    }
    total = Math.round(total * 100) / 100;

    const order = await this.prisma.$transaction(async (tx) => {
      // create order
      const o = await tx.order.create({
        data: {
          customerId: dto.customerId,
          totalAmount: total,
          status: PaymentStatus.PAID,
          method: dto.method ?? PaymentMethod.CASH,
          items: {
            create: dto.items.map((it) => {
              const p = products.find(pp => pp.id === it.productId)!;
              return { productId: it.productId, quantity: it.quantity, unitPrice: p.price };
            }),
          },
        },
        include: { items: { include: { product: true } } },
      });
      // decrement stock
      for (const it of dto.items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }
      // record Payment for revenue reporting
      await tx.payment.create({
        data: {
          userId: dto.customerId,
          amount: total,
          status: PaymentStatus.PAID,
          method: dto.method ?? PaymentMethod.CASH,
          type: 'PRODUCT_SALE',
          notes: `POS order ${o.id}`,
        },
      });
      return o;
    });

    return order;
  }
}
