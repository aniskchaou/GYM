import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GiftCardsService } from './gift-cards.service';

@ApiTags('Gift Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gift-cards')
export class GiftCardsController {
  constructor(private service: GiftCardsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  list(@CurrentUser('gymId') gymId: string) {
    return this.service.list(gymId);
  }

  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.service.myCards(userId);
  }

  @Get('lookup')
  lookup(@CurrentUser('gymId') gymId: string, @Query('code') code: string) {
    return this.service.lookupByCode(gymId, code);
  }

  @Get(':id')
  get(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.get(gymId, id);
  }

  @Post('purchase')
  purchase(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: any,
  ) {
    return this.service.purchase(gymId, userId, dto);
  }

  @Post('redeem')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  redeem(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { code: string; amount: number; reference?: string },
  ) {
    return this.service.redeem(gymId, userId, dto);
  }

  @Post(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  cancel(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.cancel(gymId, id);
  }
}
