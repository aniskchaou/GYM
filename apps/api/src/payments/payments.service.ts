import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key && !key.includes('placeholder')) {
      this.stripe = new Stripe(key, { apiVersion: '2024-04-10' });
    }
  }

  private get stripeClient(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Add STRIPE_SECRET_KEY in server/.env');
    }
    return this.stripe;
  }

  private get frontendUrl() {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  private get paypalBaseUrl() {
    const mode = (this.config.get<string>('PAYPAL_MODE') ?? 'sandbox').toLowerCase();
    return mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  }

  private async getPayPalAccessToken() {
    const clientId = this.config.get<string>('PAYPAL_CLIENT_ID');
    const secret = this.config.get<string>('PAYPAL_CLIENT_SECRET');
    if (!clientId || !secret) {
      throw new BadRequestException('PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in server/.env');
    }

    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const response = await fetch(`${this.paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to authenticate with PayPal');
    }

    const data = await response.json();
    return data.access_token as string;
  }

  // ── Create payment intent for one-time payment ────────────────────────
  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
    const intent = await this.stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: intent.client_secret };
  }

  // ── Create Stripe subscription ────────────────────────────────────────
  async createSubscription(customerId: string, stripePriceId: string) {
    return this.stripeClient.subscriptions.create({
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
      event = this.stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
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
    if (payment.stripePaymentId) {
      try {
        await this.stripeClient.refunds.create({
          payment_intent: payment.stripePaymentId,
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

  async createStripeCheckout(gymId: string, staffId: string, dto: { memberId: string; amount: number; currency?: string; description?: string; membershipId?: string; successUrl?: string; cancelUrl?: string }) {
    if (!dto.memberId || !dto.amount || dto.amount <= 0) {
      throw new BadRequestException('memberId and positive amount are required');
    }

    const currency = (dto.currency ?? 'USD').toUpperCase();
    const payment = await this.prisma.payment.create({
      data: {
        userId: dto.memberId,
        membershipId: dto.membershipId ?? null,
        amount: dto.amount,
        currency,
        status: 'PENDING',
        method: 'STRIPE',
        type: 'MEMBERSHIP',
        notes: dto.description ?? 'Stripe checkout payment',
      },
    });

    const successUrl = dto.successUrl ?? `${this.frontendUrl}/dashboard/collect-payment?gateway=stripe&paymentId=${payment.id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = dto.cancelUrl ?? `${this.frontendUrl}/dashboard/collect-payment?gateway=stripe&paymentId=${payment.id}&canceled=1`;

    const session = await this.stripeClient.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(dto.amount * 100),
            product_data: {
              name: dto.description ?? 'GymFlow payment',
            },
          },
        },
      ],
      metadata: {
        paymentId: payment.id,
        gymId,
        memberId: dto.memberId,
        membershipId: dto.membershipId ?? '',
      },
    });

    return { paymentId: payment.id, url: session.url, sessionId: session.id };
  }

  async completeStripeCheckout(gymId: string, dto: { sessionId: string; paymentId: string }) {
    const session = await this.stripeClient.checkout.sessions.retrieve(dto.sessionId, {
      expand: ['payment_intent'],
    });

    if (session.metadata?.paymentId !== dto.paymentId || session.metadata?.gymId !== gymId) {
      throw new BadRequestException('Stripe session does not match payment context');
    }

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;
    const isPaid = session.payment_status === 'paid';

    const updated = await this.prisma.payment.update({
      where: { id: dto.paymentId },
      data: {
        status: isPaid ? 'PAID' : 'FAILED',
        stripePaymentId: paymentIntent?.id ?? undefined,
      },
    });

    if (isPaid && updated.membershipId) {
      await this.prisma.membership.updateMany({
        where: { id: updated.membershipId },
        data: { status: 'ACTIVE' },
      });
    }

    return { payment: updated, paid: isPaid };
  }

  async createPayPalOrder(gymId: string, staffId: string, dto: { memberId: string; amount: number; currency?: string; description?: string; membershipId?: string; returnUrl?: string; cancelUrl?: string }) {
    if (!dto.memberId || !dto.amount || dto.amount <= 0) {
      throw new BadRequestException('memberId and positive amount are required');
    }

    const currency = (dto.currency ?? 'USD').toUpperCase();
    const payment = await this.prisma.payment.create({
      data: {
        userId: dto.memberId,
        membershipId: dto.membershipId ?? null,
        amount: dto.amount,
        currency,
        status: 'PENDING',
        method: 'PAYPAL',
        type: 'MEMBERSHIP',
        notes: dto.description ?? 'PayPal payment',
      },
    });

    const token = await this.getPayPalAccessToken();
    const returnUrl = dto.returnUrl ?? `${this.frontendUrl}/dashboard/collect-payment?gateway=paypal&paymentId=${payment.id}`;
    const cancelUrl = dto.cancelUrl ?? `${this.frontendUrl}/dashboard/collect-payment?gateway=paypal&paymentId=${payment.id}&canceled=1`;

    const response = await fetch(`${this.paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: payment.id,
            amount: {
              currency_code: currency,
              value: dto.amount.toFixed(2),
            },
            description: dto.description ?? 'GymFlow payment',
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to create PayPal order');
    }

    const order = await response.json();
    const approveUrl = (order.links ?? []).find((link: any) => link.rel === 'approve')?.href;
    if (!approveUrl) {
      throw new BadRequestException('PayPal order missing approval URL');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { metadata: JSON.stringify({ paypalOrderId: order.id }) },
    });

    return { paymentId: payment.id, orderId: order.id, approveUrl };
  }

  async capturePayPalOrder(gymId: string, dto: { paymentId: string; orderId: string }) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: dto.paymentId,
        user: { gymId },
      },
    });
    if (!payment) throw new BadRequestException('Payment not found');

    const token = await this.getPayPalAccessToken();
    const response = await fetch(`${this.paypalBaseUrl}/v2/checkout/orders/${dto.orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to capture PayPal order');
    }

    const capture = await response.json();
    const completed = capture.status === 'COMPLETED';

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: completed ? 'PAID' : 'FAILED',
        metadata: JSON.stringify({ paypalOrderId: dto.orderId, captureId: capture.id }),
      },
    });

    if (completed && updated.membershipId) {
      await this.prisma.membership.updateMany({
        where: { id: updated.membershipId },
        data: { status: 'ACTIVE' },
      });
    }

    return { payment: updated, completed };
  }

  async getMemberPaymentHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
