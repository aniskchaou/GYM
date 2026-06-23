import { Controller, Post, Body, Get, Param, Query, UseGuards, RawBodyRequest, Req, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  createIntent(@Body() dto: { amount: number; currency: string; metadata?: Record<string, string> }) {
    return this.service.createPaymentIntent(dto.amount, dto.currency, dto.metadata || {});
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MEMBER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my own payment history (member)' })
  myHistory(@CurrentUser('id') userId: string) {
    return this.service.getMemberPaymentHistory(userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  history(
    @CurrentUser('gymId') gymId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.service.getPaymentHistory(gymId, page, limit);
  }

  @Post('collect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Collect a cash/manual payment from a member' })
  collect(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') staffId: string,
    @Body() dto: { memberId: string; amount: number; method: string; description?: string; membershipId?: string },
  ) {
    return this.service.collectManualPayment(gymId, staffId, dto);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_OWNER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate refund for a payment' })
  refund(
    @Param('id') id: string,
    @CurrentUser('gymId') gymId: string,
    @Body('reason') reason?: string,
  ) {
    return this.service.refundPayment(id, gymId, reason);
  }

  @Post('webhook')
  @ApiExcludeEndpoint()
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.service.handleWebhook(req.rawBody, sig);
  }
}
