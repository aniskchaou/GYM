import { Injectable, NotFoundException } from '@nestjs/common';
import { StockMoveType } from '@prisma/client';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  // Suppliers
  listSuppliers(gymId: string) {
    return this.prisma.supplier.findMany({ where: { gymId }, orderBy: { name: 'asc' } });
  }

  createSupplier(gymId: string, dto: any) {
    return this.prisma.supplier.create({
      data: {
        gymId,
        name: dto.name,
        contact: dto.contact ?? dto.contactName ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        notes: dto.notes ?? null,
      },
    });
  }

  async updateSupplier(gymId: string, id: string, dto: any) {
    const s = await this.prisma.supplier.findFirst({ where: { id, gymId } });
    if (!s) throw new NotFoundException('Supplier not found');
    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.contact !== undefined && { contact: dto.contact }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async deleteSupplier(gymId: string, id: string) {
    const s = await this.prisma.supplier.findFirst({ where: { id, gymId } });
    if (!s) throw new NotFoundException('Supplier not found');
    await this.prisma.supplier.delete({ where: { id } });
    return { success: true };
  }

  // Stock movements
  async listMovements(gymId: string, productId?: string) {
    const products = await this.prisma.product.findMany({
      where: { gymId },
      select: { id: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p.name] as const));
    const rows = await this.prisma.stockMovement.findMany({
      where: {
        productId: productId ? productId : { in: products.map((p) => p.id) },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map((r) => ({ ...r, productName: productMap.get(r.productId) ?? null }));
  }

  async recordMovement(
    gymId: string,
    userId: string,
    dto: { productId: string; type: StockMoveType; quantity: number; reason?: string; reference?: string },
  ) {
    const product = await this.prisma.product.findFirst({ where: { id: dto.productId, gymId } });
    if (!product) throw new NotFoundException('Product not found');
    const outbound = dto.type === StockMoveType.SALE || dto.type === StockMoveType.EXPIRY;
    const delta = outbound ? -Math.abs(dto.quantity) : Math.abs(dto.quantity);
    const newStock = Math.max(0, (product.stock ?? 0) + delta);
    const [, movement] = await this.prisma.$transaction([
      this.prisma.product.update({ where: { id: product.id }, data: { stock: newStock } }),
      this.prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason ?? null,
          reference: dto.reference ?? `by:${userId}`,
        },
      }),
    ]);
    if (newStock <= LOW_STOCK_THRESHOLD) {
      await this.events.emit(APP_EVENTS.LOW_STOCK_ALERT, {
        gymId,
        meta: { productId: product.id, name: product.name, stock: newStock, threshold: LOW_STOCK_THRESHOLD },
      });
    }
    return movement;
  }

  /** Auto-decrement stock when POS order is created (event listener). */
  @OnEvent(APP_EVENTS.PRODUCT_PURCHASED)
  async onProductPurchased(payload: any) {
    const items: Array<{ productId: string; quantity: number }> = payload?.meta?.items ?? [];
    for (const it of items) {
      try {
        await this.recordMovement(payload.gymId, payload.userId, {
          productId: it.productId,
          type: StockMoveType.SALE,
          quantity: it.quantity,
          reference: `order:${payload?.meta?.orderId ?? ''}`,
        });
      } catch {
        /* ignore */
      }
    }
  }

  /** Cron-style scan for low stock and emit alerts. */
  async scanLowStock(gymId: string) {
    const lows = await this.prisma.product.findMany({
      where: { gymId, isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
    });
    for (const p of lows) {
      await this.events.emit(APP_EVENTS.LOW_STOCK_ALERT, {
        gymId,
        meta: { productId: p.id, name: p.name, stock: p.stock },
      });
    }
    return { count: lows.length, items: lows };
  }
}
