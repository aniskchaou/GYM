import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LoyaltyService } from './loyalty.service';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private service: LoyaltyService) {}

  // Account
  @Get('account')
  account(@CurrentUser('id') userId: string, @CurrentUser('gymId') gymId?: string) {
    return this.service.myAccount(userId, gymId);
  }

  @Get('leaderboard')
  leaderboard(@CurrentUser('gymId') gymId: string) {
    return this.service.leaderboard(gymId);
  }

  // Tiers
  @Get('tiers')
  tiers(@CurrentUser('gymId') gymId: string) {
    return this.service.listTiers(gymId);
  }

  @Post('tiers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  createTier(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.createTier(gymId, dto);
  }

  @Patch('tiers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  updateTier(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateTier(gymId, id, dto);
  }

  @Delete('tiers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  deleteTier(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.deleteTier(gymId, id);
  }

  // Rewards
  @Get('rewards')
  rewards(@CurrentUser('gymId') gymId: string) {
    return this.service.listRewards(gymId);
  }

  @Post('rewards')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  createReward(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.createReward(gymId, dto);
  }

  @Patch('rewards/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  updateReward(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateReward(gymId, id, dto);
  }

  @Delete('rewards/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  deleteReward(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.deleteReward(gymId, id);
  }

  @Post('rewards/:id/redeem')
  redeem(@CurrentUser('id') userId: string, @CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.redeem(userId, gymId, id);
  }

  // Manual award (staff)
  @Post('award')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  award(
    @CurrentUser('gymId') gymId: string,
    @Body() dto: { userId: string; points: number; reason: string },
  ) {
    return this.service.awardPoints(dto.userId, gymId, Number(dto.points), dto.reason);
  }
}
