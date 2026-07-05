import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, MinLength, IsEnum, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GymsService } from './gyms.service';
import { UserRole, GymPlanTier } from '@prisma/client';

class RegisterGymDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsEmail() ownerEmail: string;
  @ApiProperty() @IsString() ownerFirstName: string;
  @ApiProperty() @IsString() ownerLastName: string;
  @ApiProperty() @IsString() @MinLength(8) ownerPassword: string;
  @ApiProperty({ enum: GymPlanTier, required: false }) @IsOptional() @IsEnum(GymPlanTier) planTier?: GymPlanTier;
}

class RegisterMemberDto {
  @ApiProperty() @IsString() gymId: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() gender?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() planId?: string;
}

class SetCommissionDto {
  @ApiProperty() @IsNumber() @Min(0) @Max(100) @Type(() => Number) rate: number;
}

class UpdateGymDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() logoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() primaryColor?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() website?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() city?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() country?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() timezone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() currency?: string;
}

class CheckoutDto {
  @ApiProperty({ enum: GymPlanTier }) @IsEnum(GymPlanTier) planTier: GymPlanTier;
}

class StripeCallbackDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() state?: string;
}

@ApiTags('gyms')
@Controller('gyms')
export class GymsController {
  constructor(private service: GymsService) {}

  // ─── Public ─────────────────────────────────────────────────────────────

  /** Public self-service gym registration */
  @Post('register')
  @ApiOperation({ summary: 'Register a new gym (self-service onboarding)' })
  register(@Body() dto: RegisterGymDto) {
    return this.service.createTenant(dto);
  }

  /** Public: member self-registration under a specific gym */
  @Post('register-member')
  @ApiOperation({ summary: 'Member self-registration (choose gym + create account)' })
  registerMember(@Body() dto: RegisterMemberDto) {
    return this.service.registerMember(dto);
  }

  /** Public: discover gyms with search/filter */
  @Get('discover')
  @ApiOperation({ summary: 'Public gym discovery (no auth)' })
  discover(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('minRating') minRating?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.discoverGyms({
      search, city,
      minRating: minRating ? parseFloat(minRating) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /** Public: individual gym profile by slug */
  @Get('profile/:slug')
  @ApiOperation({ summary: 'Get public gym profile by slug' })
  publicProfile(@Param('slug') slug: string) {
    return this.service.getPublicGymProfile(slug);
  }

  /** Pricing plans for display on onboarding / settings */
  @Get('pricing')
  @ApiOperation({ summary: 'Get GymFlow platform pricing plans' })
  pricing() {
    return this.service.getPricingPlans();
  }

  // ─── Authenticated (own gym) ─────────────────────────────────────────────

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get my gym info' })
  myGym(@CurrentUser('gymId') gymId: string) {
    return this.service.myGym(gymId);
  }

  @Patch('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Update my gym info' })
  updateMyGym(@CurrentUser('gymId') gymId: string, @Body() dto: UpdateGymDto) {
    return this.service.updateMyGym(gymId, dto);
  }

  @Get('my/policies')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'Get my gym policies' })
  myPolicies(@CurrentUser('gymId') gymId: string) {
    return this.service.getMyPolicies(gymId);
  }

  @Patch('my/policies')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Update my gym policies' })
  updateMyPolicies(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.updateMyPolicies(gymId, dto);
  }

  // ─── Stripe Connect ──────────────────────────────────────────────────────

  @Get('my/stripe-connect/url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Get Stripe Connect OAuth URL' })
  stripeConnectUrl(@CurrentUser('gymId') gymId: string) {
    return this.service.getStripeConnectUrl(gymId);
  }

  @Post('my/stripe-connect/callback')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Exchange Stripe OAuth code for connected account' })
  stripeConnectCallback(@CurrentUser('gymId') gymId: string, @Body() dto: StripeCallbackDto) {
    return this.service.handleStripeConnectCallback(dto.code, gymId);
  }

  @Delete('my/stripe-connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Disconnect Stripe Connect account' })
  stripeConnectDisconnect(@CurrentUser('gymId') gymId: string) {
    return this.service.disconnectStripeConnect(gymId);
  }

  // ─── Platform Billing ────────────────────────────────────────────────────

  @Post('my/billing/checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Create Stripe Checkout session to subscribe to a plan' })
  createCheckout(@CurrentUser('gymId') gymId: string, @Body() dto: CheckoutDto) {
    return this.service.createPlatformCheckoutSession(gymId, dto.planTier);
  }

  @Post('my/billing/portal')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Create Stripe Billing Portal session' })
  billingPortal(@CurrentUser('gymId') gymId: string) {
    return this.service.createBillingPortalSession(gymId);
  }

  @Get('my/billing/invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'List SaaS invoices for my gym' })
  myInvoices(@CurrentUser('gymId') gymId: string) {
    return this.service.listSaasInvoices(gymId);
  }

  @Post('my/billing/update-payment-method')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Open Stripe portal to update payment method' })
  updatePaymentMethod(@CurrentUser('gymId') gymId: string) {
    return this.service.createBillingPortalSession(gymId);
  }

  // ─── Super-admin ─────────────────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a gym (super-admin)' })
  create(@Body() dto: RegisterGymDto) { return this.service.createGym(dto); }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all gyms (super-admin)' })
  list() { return this.service.list(); }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Platform stats (super-admin)' })
  stats() { return this.service.stats(); }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get gym by ID (super-admin)' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update gym (super-admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateGymDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Hard-delete a gym (super-admin)' })
  remove(@Param('id') id: string) { return this.service.hardDeleteGym(id); }

  @Post(':id/impersonate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Impersonate gym owner — returns short-lived access token (super-admin)' })
  impersonate(@Param('id') id: string) { return this.service.impersonateGym(id); }

  @Get('sa/users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all users across all gyms (super-admin)' })
  allUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('gymId') gymId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listAllUsers({ search, role, gymId, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Patch('sa/users/:userId/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Toggle user email-verified/active status (super-admin)' })
  setUserStatus(@Param('userId') userId: string, @Body('verified') verified: boolean) {
    return this.service.setUserVerified(userId, verified);
  }

  // ─── Gym Owner — Staff Management ────────────────────────────────────

  @Get('my/staff')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'List all staff for my gym' })
  listStaff(@CurrentUser('gymId') gymId: string) {
    return this.service.listStaff(gymId);
  }

  @Post('my/staff')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'Create a staff member for my gym' })
  createStaff(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.createStaff(gymId, dto);
  }

  @Patch('my/staff/:staffId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'Update a staff member' })
  updateStaff(
    @CurrentUser('gymId') gymId: string,
    @Param('staffId') staffId: string,
    @Body() dto: any,
  ) {
    return this.service.updateStaff(gymId, staffId, dto);
  }

  @Delete('my/staff/:staffId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Remove a staff member from my gym' })
  removeStaff(@CurrentUser('gymId') gymId: string, @Param('staffId') staffId: string) {
    return this.service.removeStaff(gymId, staffId);
  }

  @Get('my/payroll')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'Payroll summary for my gym' })
  payroll(@CurrentUser('gymId') gymId: string) {
    return this.service.getPayroll(gymId);
  }

  @Patch(':id/commission')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Set platform commission rate for a gym (super-admin)' })
  setCommission(@Param('id') id: string, @Body() dto: SetCommissionDto) {
    return this.service.setCommissionRate(id, dto.rate);
  }
}
