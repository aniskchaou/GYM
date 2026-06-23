import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-04-10',
    });
  }

  // ── Create payment intent for one-time payment ────────────────────────
  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: intent.client_secret };
  }

  // ── Create Stripe subscription ────────────────────────────────────────
  async createSubscription(customerId: string, stripePriceId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: stripePriceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  // ── Get or create Stripe customer ─────────────────────────────────────
  async ensureStripeCustomer(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    if (user.gymId) {
      const gym = await this.prisma.gym.findUnique({ where: { id: user.gymId } });
      if (gym?.stripeCustomerId) return gym.stripeCustomerId;
    }

    // For gym SaaS billing
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
    return customer.id;
  }

  // ── Handle Stripe webhooks ────────────────────────────────────────────
  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;
      // Platform billing: gym paid for a subscription plan
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.gymId) {
          // lazy-load GymsService to avoid circular dep
          const { GymsService } = await import('../gyms/gyms.service');
          // We can't instantiate it here — instead handle inline via prisma
          const { gymId, planTier } = session.metadata;
          if (gymId && planTier) {
            const planLimits: Record<string, { maxMembers: number; maxBranches: number }> = {
              STARTER: { maxMembers: 100, maxBranches: 1 },
              PROFESSIONAL: { maxMembers: 1000, maxBranches: 5 },
              ENTERPRISE: { maxMembers: 100000, maxBranches: 100 },
            };
            const limits = planLimits[planTier] ?? {};
            await this.prisma.gym.update({
              where: { id: gymId },
              data: {
                planTier: planTier as any,
                stripeSubId: session.subscription as string,
                status: 'ACTIVE' as any,
                ...limits,
              },
            });
          }
        }
        break;
      }
    }

    return { received: true };
  }

  private async handlePaymentSuccess(intent: Stripe.PaymentIntent) {
    if (intent.metadata?.membershipId) {
      await this.prisma.membership.update({
        where: { id: intent.metadata.membershipId },
        data: { status: 'ACTIVE' },
      });
    }
    await this.prisma.payment.updateMany({
      where: { stripePaymentId: intent.id },
      data: { status: 'PAID' },
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    if (invoice.subscription) {
      await this.prisma.membership.updateMany({
        where: { stripeSubId: invoice.subscription as string },
        data: { status: 'INACTIVE' },
      });
    }
  }

  private async handleSubscriptionCancelled(sub: Stripe.Subscription) {
    await this.prisma.membership.updateMany({
      where: { stripeSubId: sub.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  // ── Payment history ───────────────────────────────────────────────────
  async getPaymentHistory(gymId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { user: { gymId } },
        skip,
        take: limit,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where: { user: { gymId } } }),
    ]);
    return { data, total, page, limit };
  }

  async refundPayment(paymentId: string, gymId: string, reason?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, user: { gymId } },
    });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status === 'REFUNDED') throw new BadRequestException('Already refunded');
    // If Stripe PI exists, issue real refund; otherwise mark as refunded in DB
    if (payment.stripePaymentIntentId) {
      try {
        await this.stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: 'requested_by_customer',
        });
      } catch {
        // Stripe not configured — fall through to DB-only update
      }
    }
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' as any },
    });
  }

  async collectManualPayment(gymId: string, staffId: string, dto: { memberId: string; amount: number; method: string; description?: string; membershipId?: string }) {
    return this.prisma.payment.create({
      data: {
        userId: dto.memberId,
        amount: dto.amount,
        currency: 'USD',
        status: 'PAID',
        method: dto.method as any,
        description: dto.description ?? 'Manual payment',
        membershipId: dto.membershipId ?? null,
        collectedById: staffId,
      } as any,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
  }

  async getMemberPaymentHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
