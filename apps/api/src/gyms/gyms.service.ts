import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { GymStatus, GymPlanTier, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';

const PLAN_LIMITS: Record<GymPlanTier, { maxMembers: number; maxBranches: number }> = {
  STARTER: { maxMembers: 100, maxBranches: 1 },
  PROFESSIONAL: { maxMembers: 1000, maxBranches: 5 },
  ENTERPRISE: { maxMembers: 100000, maxBranches: 100 },
};

const PLAN_MONTHLY_USD: Record<GymPlanTier, number> = {
  STARTER: 29,
  PROFESSIONAL: 99,
  ENTERPRISE: 299,
};

@Injectable()
export class GymsService {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key && !key.includes('placeholder')) {
      this.stripe = new Stripe(key, { apiVersion: '2024-04-10' });
    }
  }

  private get stripeClient(): Stripe {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured. Add STRIPE_SECRET_KEY to your .env');
    return this.stripe;
  }

  async list() {
    const gyms = await this.prisma.gym.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, branches: true } },
      },
    });
    return gyms;
  }

  async findOne(id: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, branches: true, membershipPlans: true, classes: true } },
        branches: true,
      },
    });
    if (!gym) throw new NotFoundException('Gym not found');
    return gym;
  }

  async stats() {
    const [total, active, suspended, trial] = await Promise.all([
      this.prisma.gym.count(),
      this.prisma.gym.count({ where: { status: GymStatus.ACTIVE } }),
      this.prisma.gym.count({ where: { status: GymStatus.SUSPENDED } }),
      this.prisma.gym.count({ where: { status: GymStatus.TRIAL } }),
    ]);
    // Aggregate MRR from active gyms based on planTier (simplistic)
    const planMrr: Record<GymPlanTier, number> = { STARTER: 29, PROFESSIONAL: 99, ENTERPRISE: 299 };
    const byPlan = await this.prisma.gym.groupBy({
      by: ['planTier'],
      where: { status: GymStatus.ACTIVE },
      _count: { _all: true },
    });
    const mrr = byPlan.reduce((sum, row) => sum + (planMrr[row.planTier] ?? 0) * row._count._all, 0);
    return { total, active, suspended, trial, mrr, arr: mrr * 12 };
  }

  /** Onboard a new tenant: creates the Gym, a main Branch and the owner User. */
  async createTenant(dto: {
    name: string;
    slug: string;
    email: string;
    ownerEmail: string;
    ownerFirstName: string;
    ownerLastName: string;
    ownerPassword: string;
    planTier?: GymPlanTier;
    timezone?: string;
    currency?: string;
    trialDays?: number;
  }) {
    const slug = dto.slug.toLowerCase().trim();
    const exists = await this.prisma.gym.findUnique({ where: { slug } });
    if (exists) throw new BadRequestException('Slug already in use');
    const emailExists = await this.prisma.user.findUnique({ where: { email: dto.ownerEmail.toLowerCase() } });
    if (emailExists) throw new BadRequestException('Owner email already registered');

    const planTier = dto.planTier ?? GymPlanTier.STARTER;
    const limits = PLAN_LIMITS[planTier];
    const trialDays = dto.trialDays ?? 14;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    const passwordHash = await bcrypt.hash(dto.ownerPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const gym = await tx.gym.create({
        data: {
          name: dto.name,
          slug,
          email: dto.email,
          planTier,
          status: GymStatus.TRIAL,
          trialEndsAt,
          timezone: dto.timezone ?? 'UTC',
          currency: dto.currency ?? 'EUR',
          maxMembers: limits.maxMembers,
          maxBranches: limits.maxBranches,
        },
      });
      const branch = await tx.branch.create({
        data: { gymId: gym.id, name: 'Main Branch', capacity: 100 },
      });
      const owner = await tx.user.create({
        data: {
          gymId: gym.id,
          branchId: branch.id,
          role: UserRole.GYM_OWNER,
          email: dto.ownerEmail.toLowerCase(),
          firstName: dto.ownerFirstName,
          lastName: dto.ownerLastName,
          passwordHash,
          isEmailVerified: true,
        },
      });
      return { gym, branch, owner };
    });
    return { gym: result.gym, ownerId: result.owner.id };
  }

  async update(id: string, dto: any) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) throw new NotFoundException('Gym not found');
    const data: any = {};
    for (const k of ['name', 'email', 'phone', 'logoUrl', 'coverUrl', 'primaryColor', 'website',
      'address', 'city', 'country', 'timezone', 'currency'] as const) {
      if (dto[k] !== undefined) data[k] = dto[k];
    }
    return this.prisma.gym.update({ where: { id }, data });
  }

  async setStatus(id: string, status: GymStatus) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) throw new NotFoundException('Gym not found');
    return this.prisma.gym.update({ where: { id }, data: { status } });
  }

  suspend(id: string) { return this.setStatus(id, GymStatus.SUSPENDED); }
  reactivate(id: string) { return this.setStatus(id, GymStatus.ACTIVE); }

  async changePlan(id: string, planTier: GymPlanTier) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) throw new NotFoundException('Gym not found');
    const limits = PLAN_LIMITS[planTier];
    return this.prisma.gym.update({
      where: { id },
      data: { planTier, maxMembers: limits.maxMembers, maxBranches: limits.maxBranches },
    });
  }

  async softDelete(id: string) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) throw new NotFoundException('Gym not found');
    return this.prisma.gym.update({
      where: { id },
      data: { status: GymStatus.CANCELLED },
    });
  }

  /** Current gym profile for the authenticated owner/staff. */
  async myGym(gymId: string) {
    if (!gymId) return null;
    return this.prisma.gym.findUnique({
      where: { id: gymId },
      include: { _count: { select: { users: true, branches: true } }, branches: true },
    });
  }

  async updateMyGym(gymId: string, dto: {
    name?: string; email?: string; phone?: string; logoUrl?: string;
    primaryColor?: string; website?: string; address?: string; city?: string;
    country?: string; timezone?: string; currency?: string;
  }) {
    if (!gymId) throw new BadRequestException('No gym associated');
    const data: any = {};
    for (const k of ['name', 'email', 'phone', 'logoUrl', 'primaryColor', 'website',
      'address', 'city', 'country', 'timezone', 'currency']) {
      if ((dto as any)[k] !== undefined) data[k] = (dto as any)[k];
    }
    return this.prisma.gym.update({ where: { id: gymId }, data });
  }

  // ─── Stripe Connect OAuth ─────────────────────────────────────────────────

  /** Generate the Stripe Connect OAuth authorisation URL */
  getStripeConnectUrl(gymId: string) {
    const clientId = this.config.get<string>('STRIPE_CLIENT_ID');
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    if (!clientId || clientId.includes('placeholder')) {
      throw new BadRequestException('STRIPE_CLIENT_ID is not configured');
    }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: 'read_write',
      redirect_uri: `${frontendUrl}/auth/stripe-callback`,
      state: gymId, // verified on callback
    });
    return { url: `https://connect.stripe.com/oauth/authorize?${params.toString()}` };
  }

  /** Exchange OAuth code for access token and persist the connected account ID */
  async handleStripeConnectCallback(code: string, gymId: string) {
    const response = await this.stripeClient.oauth.token({
      grant_type: 'authorization_code',
      code,
    });
    const accountId = response.stripe_user_id;
    if (!accountId) throw new BadRequestException('Stripe OAuth failed: no account ID returned');
    await this.prisma.gym.update({
      where: { id: gymId },
      data: { stripeConnectAccountId: accountId } as any,
    });
    return { connected: true, accountId };
  }

  /** Disconnect a Stripe Connect account from this gym */
  async disconnectStripeConnect(gymId: string) {
    const gym = await this.prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) throw new NotFoundException('Gym not found');
    const accountId = (gym as any).stripeConnectAccountId;
    if (accountId) {
      try { await this.stripeClient.oauth.deauthorize({ client_id: this.config.get('STRIPE_CLIENT_ID'), stripe_user_id: accountId }); } catch {}
    }
    await this.prisma.gym.update({ where: { id: gymId }, data: { stripeConnectAccountId: null } as any });
    return { disconnected: true };
  }

  // ─── Platform Billing ─────────────────────────────────────────────────────

  /** Ensure the gym has a Stripe customer for platform billing */
  private async ensurePlatformCustomer(gymId: string): Promise<string> {
    const gym = await this.prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) throw new NotFoundException('Gym not found');
    if (gym.stripeCustomerId) return gym.stripeCustomerId;
    const customer = await this.stripeClient.customers.create({
      email: gym.email,
      name: gym.name,
      metadata: { gymId },
    });
    await this.prisma.gym.update({ where: { id: gymId }, data: { stripeCustomerId: customer.id } });
    return customer.id;
  }

  /** Create a Stripe Checkout Session so the gym can subscribe to a plan */
  async createPlatformCheckoutSession(gymId: string, planTier: GymPlanTier) {
    const priceIdMap: Record<GymPlanTier, string> = {
      STARTER: this.config.get('STRIPE_PRICE_STARTER'),
      PROFESSIONAL: this.config.get('STRIPE_PRICE_PROFESSIONAL'),
      ENTERPRISE: this.config.get('STRIPE_PRICE_ENTERPRISE'),
    };
    const priceId = priceIdMap[planTier];
    if (!priceId || priceId.includes('placeholder')) {
      throw new BadRequestException(`Stripe price ID for ${planTier} is not configured`);
    }
    const customerId = await this.ensurePlatformCustomer(gymId);
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const session = await this.stripeClient.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard/settings?tab=billing&success=1`,
      cancel_url: `${frontendUrl}/dashboard/settings?tab=billing`,
      metadata: { gymId, planTier },
    });
    return { url: session.url };
  }

  /** Create a Stripe Billing Portal session so the gym can manage their subscription */
  async createBillingPortalSession(gymId: string) {
    const customerId = await this.ensurePlatformCustomer(gymId);
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const session = await this.stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${frontendUrl}/dashboard/settings?tab=billing`,
    });
    return { url: session.url };
  }

  /** Handle Stripe webhook: checkout.session.completed → activate subscription */
  async handlePlatformSubscriptionActivated(session: Stripe.Checkout.Session) {
    const { gymId, planTier } = session.metadata ?? {};
    if (!gymId || !planTier) return;
    await this.prisma.gym.update({
      where: { id: gymId },
      data: {
        planTier: planTier as GymPlanTier,
        stripeSubId: session.subscription as string,
        status: GymStatus.ACTIVE,
        stripePlanTier: planTier,
        ...(PLAN_LIMITS[planTier as GymPlanTier] ?? {}),
      } as any,
    });
  }

  /** Handle Stripe webhook: subscription deleted → downgrade gym to TRIAL */
  async handlePlatformSubscriptionCancelled(sub: Stripe.Subscription) {
    await this.prisma.gym.updateMany({
      where: { stripeSubId: sub.id },
      data: { stripeSubId: null, status: GymStatus.TRIAL },
    });
  }

  /** Return pricing plans for the frontend */
  getPricingPlans() {
    return [
      {
        tier: 'STARTER',
        name: 'Starter',
        price: PLAN_MONTHLY_USD.STARTER,
        maxMembers: PLAN_LIMITS.STARTER.maxMembers,
        maxBranches: PLAN_LIMITS.STARTER.maxBranches,
        features: ['Up to 100 members', '1 branch', 'Attendance tracking', 'Class scheduling', 'Basic reports'],
      },
      {
        tier: 'PROFESSIONAL',
        name: 'Professional',
        price: PLAN_MONTHLY_USD.PROFESSIONAL,
        maxMembers: PLAN_LIMITS.PROFESSIONAL.maxMembers,
        maxBranches: PLAN_LIMITS.PROFESSIONAL.maxBranches,
        features: ['Up to 1,000 members', '5 branches', 'All Starter features', 'Advanced analytics', 'Stripe payments', 'Trainer management'],
        popular: true,
      },
      {
        tier: 'ENTERPRISE',
        name: 'Enterprise',
        price: PLAN_MONTHLY_USD.ENTERPRISE,
        maxMembers: PLAN_LIMITS.ENTERPRISE.maxMembers,
        maxBranches: PLAN_LIMITS.ENTERPRISE.maxBranches,
        features: ['Unlimited members', '100 branches', 'All Professional features', 'White-label', 'Priority support', 'Custom integrations'],
      },
    ];
  }

  // ─── Public Discovery ─────────────────────────────────────────────────────

  /** Public listing of active gyms with optional search/filter */
  async discoverGyms(opts: { search?: string; city?: string; minRating?: number; page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? 12, 50);
    const skip = (page - 1) * limit;

    const where: any = { status: { in: ['ACTIVE', 'TRIAL'] } };
    if (opts.search) where.OR = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { city: { contains: opts.search, mode: 'insensitive' } },
      { description: { contains: opts.search, mode: 'insensitive' } },
    ];
    if (opts.city) where.city = { contains: opts.city, mode: 'insensitive' };
    if (opts.minRating) where.rating = { gte: opts.minRating };

    const [gyms, total] = await Promise.all([
      this.prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true, name: true, slug: true, logoUrl: true, coverUrl: true,
          description: true, city: true, country: true, address: true,
          phone: true, website: true, rating: true, reviewCount: true,
          latitude: true, longitude: true,
          _count: { select: { users: true, branches: true } },
          membershipPlans: {
            where: { isActive: true, isPublic: true },
            orderBy: { price: 'asc' },
            take: 1,
            select: { price: true, currency: true, type: true },
          },
        },
      }),
      this.prisma.gym.count({ where }),
    ]);

    return { gyms, total, page, pages: Math.ceil(total / limit) };
  }

  /** Public gym profile by slug — used on the gym landing page */
  async getPublicGymProfile(slug: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { slug },
      select: {
        id: true, name: true, slug: true, logoUrl: true, coverUrl: true,
        description: true, city: true, country: true, address: true,
        phone: true, email: true, website: true,
        rating: true, reviewCount: true, latitude: true, longitude: true,
        platformCommissionRate: true,
        _count: { select: { users: true, branches: true } },
        branches: {
          where: { isActive: true },
          select: { id: true, name: true, address: true, city: true, phone: true, capacity: true },
        },
        membershipPlans: {
          where: { isActive: true, isPublic: true },
          orderBy: { price: 'asc' },
          select: {
            id: true, name: true, description: true, type: true,
            price: true, currency: true, durationDays: true,
            features: true, classesIncluded: true, maxVisitsPerDay: true,
          },
        },
        users: {
          where: { role: UserRole.TRAINER, isActive: true },
          select: {
            id: true, firstName: true, lastName: true, avatarUrl: true,
            trainerProfile: {
              select: { specialties: true, bio: true, rating: true, experience: true },
            },
          },
          take: 12,
        },
      },
    });
    if (!gym) throw new NotFoundException('Gym not found');
    return gym;
  }

  /** Member self-registration: create account under a specific gym */
  async registerMember(dto: {
    gymId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    planId?: string;
  }) {
    const gym = await this.prisma.gym.findUnique({ where: { id: dto.gymId } });
    if (!gym) throw new NotFoundException('Gym not found');
    if (gym.status === 'CANCELLED' as any) throw new BadRequestException('This gym is no longer active');

    const emailExists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (emailExists) throw new BadRequestException('Email already registered');

    // Get first branch
    const branch = await this.prisma.branch.findFirst({ where: { gymId: gym.id, isActive: true } });

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const memberNumber = `M${Date.now().toString(36).toUpperCase()}`;
    const qrCode = `${gym.slug}-${memberNumber}`;

    const member = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          gymId: gym.id,
          branchId: branch?.id,
          role: UserRole.MEMBER,
          email: dto.email.toLowerCase(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          passwordHash,
          isEmailVerified: false,
          gender: dto.gender as any,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        },
      });
      await tx.memberProfile.create({
        data: {
          userId: user.id,
          memberNumber,
          qrCode,
          fitnessGoals: [],
        },
      });

      // If a plan was selected, create a pending membership
      if (dto.planId) {
        const plan = await tx.membershipPlan.findFirst({
          where: { id: dto.planId, gymId: gym.id, isActive: true },
        });
        if (plan) {
          const now = new Date();
          const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
          await tx.membership.create({
            data: {
              memberId: user.id,
              planId: plan.id,
              status: 'PENDING',
              startDate: now,
              endDate,
              finalPrice: plan.price,
              autoRenew: false,
            },
          });
        }
      }
      return user;
    });

    return {
      message: 'Registration successful',
      userId: member.id,
      gymName: gym.name,
      gymSlug: gym.slug,
    };
  }

  /** Superadmin: update commission rate for a gym */
  async setCommissionRate(gymId: string, rate: number) {
    if (rate < 0 || rate > 100) throw new BadRequestException('Rate must be 0–100');
    return this.prisma.gym.update({
      where: { id: gymId },
      data: { platformCommissionRate: rate },
    });
  }

  /** Gym owner: list their SaaS subscription invoices */
  async listSaasInvoices(gymId: string) {
    const invoices = await this.prisma.saasInvoice.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });
    // If no DB invoices yet, return an empty array (not an error)
    return { invoices, total: invoices.length };
  }

  /** Superadmin: create a gym directly with ACTIVE status */
  async createGym(dto: {
    name: string; slug: string; email: string;
    ownerEmail: string; ownerFirstName: string; ownerLastName: string; ownerPassword: string;
    planTier?: GymPlanTier; city?: string; country?: string; timezone?: string; currency?: string;
    phone?: string; address?: string;
  }) {
    const slug = dto.slug.toLowerCase().trim();
    const exists = await this.prisma.gym.findUnique({ where: { slug } });
    if (exists) throw new BadRequestException('Slug already in use');
    const emailExists = await this.prisma.user.findUnique({ where: { email: dto.ownerEmail.toLowerCase() } });
    if (emailExists) throw new BadRequestException('Owner email already registered');
    const planTier = dto.planTier ?? GymPlanTier.STARTER;
    const limits = PLAN_LIMITS[planTier];
    const passwordHash = await bcrypt.hash(dto.ownerPassword, 10);
    const result = await this.prisma.$transaction(async (tx) => {
      const gym = await tx.gym.create({
        data: {
          name: dto.name, slug, email: dto.email, planTier,
          status: GymStatus.ACTIVE,
          timezone: dto.timezone ?? 'UTC', currency: dto.currency ?? 'USD',
          maxMembers: limits.maxMembers, maxBranches: limits.maxBranches,
          city: dto.city, country: dto.country, phone: dto.phone, address: dto.address,
        },
      });
      const branch = await tx.branch.create({ data: { gymId: gym.id, name: 'Main Branch', capacity: 100 } });
      const owner = await tx.user.create({
        data: {
          gymId: gym.id, branchId: branch.id, role: UserRole.GYM_OWNER,
          email: dto.ownerEmail.toLowerCase(),
          firstName: dto.ownerFirstName, lastName: dto.ownerLastName,
          passwordHash, isEmailVerified: true,
        },
      });
      return { gym, owner };
    });
    return { gym: result.gym, ownerId: result.owner.id };
  }

  /** Superadmin: hard-delete a gym and all its data */
  async hardDeleteGym(id: string) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) throw new NotFoundException('Gym not found');
    await this.prisma.gym.delete({ where: { id } });
    return { deleted: true, id };
  }

  /** Superadmin: generate a short-lived token to impersonate a gym owner */
  async impersonateGym(gymId: string) {
    const owner = await this.prisma.user.findFirst({
      where: { gymId, role: UserRole.GYM_OWNER },
    });
    if (!owner) throw new NotFoundException('No gym owner found for this gym');
    const payload = { sub: owner.id, email: owner.email, role: owner.role, gymId: owner.gymId, impersonatedBy: 'SUPER_ADMIN' };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '2h',
    });
    return {
      accessToken,
      user: { id: owner.id, email: owner.email, firstName: owner.firstName, lastName: owner.lastName, role: owner.role, gymId: owner.gymId },
    };
  }

  /** Superadmin: list all users across all gyms */
  async listAllUsers(params: { search?: string; role?: string; gymId?: string; page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.gymId) where.gymId = params.gymId;
    if (params.search) where.OR = [
      { email: { contains: params.search, mode: 'insensitive' } },
      { firstName: { contains: params.search, mode: 'insensitive' } },
      { lastName: { contains: params.search, mode: 'insensitive' } },
    ];
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, gymId: true, isEmailVerified: true, createdAt: true, avatarUrl: true,
          gym: { select: { name: true, slug: true } },
        },
      }),
    ]);
    return { users, total, page, limit };
  }

  /** Superadmin: suspend or reactivate a user */
  async setUserVerified(userId: string, verified: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id: userId }, data: { isEmailVerified: verified } });
  }

  // ─── Staff Management ─────────────────────────────────────────────────────

  async listStaff(gymId: string) {
    return this.prisma.user.findMany({
      where: { gymId, role: { in: [UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.TRAINER] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true,
        phone: true, avatarUrl: true, isEmailVerified: true, createdAt: true,
        gymId: true, branchId: true,
        branch: { select: { name: true } },
        trainerProfile: { select: { specialties: true, sessionRate: true, commissionPercent: true } },
      },
    });
  }

  async createStaff(gymId: string, dto: {
    email: string; firstName: string; lastName: string;
    role: UserRole; password: string; phone?: string; branchId?: string;
  }) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new BadRequestException('Email already in use');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        gymId, branchId: dto.branchId ?? null,
        email: dto.email.toLowerCase(),
        firstName: dto.firstName, lastName: dto.lastName,
        role: dto.role, phone: dto.phone,
        passwordHash, isEmailVerified: true,
      },
    });
    if (dto.role === UserRole.TRAINER) {
      await this.prisma.trainerProfile.create({ data: { userId: user.id } });
    }
    return user;
  }

  async updateStaff(gymId: string, staffId: string, dto: any) {
    const user = await this.prisma.user.findFirst({ where: { id: staffId, gymId } });
    if (!user) throw new NotFoundException('Staff member not found');
    const data: any = {};
    ['firstName', 'lastName', 'phone', 'role', 'branchId', 'isEmailVerified'].forEach(k => {
      if (dto[k] !== undefined) data[k] = dto[k];
    });
    return this.prisma.user.update({ where: { id: staffId }, data });
  }

  async removeStaff(gymId: string, staffId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: staffId, gymId } });
    if (!user) throw new NotFoundException('Staff member not found');
    if (user.role === UserRole.GYM_OWNER) throw new BadRequestException('Cannot remove gym owner');
    await this.prisma.user.delete({ where: { id: staffId } });
    return { deleted: true };
  }

  async getPayroll(gymId: string) {
    const [staff, trainers, members] = await Promise.all([
      this.prisma.user.count({ where: { gymId, role: { in: [UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST] } } }),
      this.prisma.user.findMany({
        where: { gymId, role: UserRole.TRAINER },
        select: {
          id: true, firstName: true, lastName: true, email: true,
          trainerProfile: { select: { sessionRate: true, commissionPercent: true, specialties: true } },
        },
      }),
      this.prisma.user.count({ where: { gymId, role: UserRole.MEMBER } }),
    ]);
    const totalTrainerCost = trainers.reduce((s, t) => s + (t.trainerProfile?.sessionRate ?? 0) * 4 * 4, 0); // 4 sessions/week × 4 weeks
    return { staff, trainerCount: trainers.length, trainers, members, estimatedMonthlyCost: totalTrainerCost };
  }
}
