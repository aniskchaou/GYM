import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { MembershipsService } from './memberships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Memberships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('memberships')
export class MembershipsController {
  constructor(private service: MembershipsService) {}

  @Get()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all memberships for a gym' })
  findAll(@CurrentUser('gymId') gymId: string, @Query() query: any) {
    return this.service.findAll(gymId, query);
  }

  @Post()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Assign membership plan to a member' })
  create(@Body() dto: any, @CurrentUser('id') staffId: string) {
    return this.service.create(dto, staffId);
  }

  @Get('member/:memberId')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.TRAINER)
  @ApiOperation({ summary: 'Get all memberships of a member' })
  getByMember(@Param('memberId') memberId: string) {
    return this.service.findByMember(memberId);
  }

  @Get('my')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get current member memberships' })
  myMemberships(@CurrentUser('id') memberId: string) {
    return this.service.findByMember(memberId);
  }

  @Patch(':id/freeze')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.MEMBER)
  @ApiOperation({ summary: 'Freeze a membership' })
  freeze(@Param('id') id: string, @Body('frozenUntil') frozenUntil: string) {
    return this.service.freeze(id, new Date(frozenUntil || Date.now() + 30 * 86400000));
  }

  @Patch(':id/unfreeze')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.MEMBER)
  @ApiOperation({ summary: 'Unfreeze a membership' })
  unfreeze(@Param('id') id: string) {
    return this.service.unfreeze(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'Cancel a membership' })
  cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.service.cancel(id, reason);
  }

  @Post(':id/renew')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Renew a membership for another period' })
  renew(
    @Param('id') id: string,
    @CurrentUser('id') staffId: string,
    @Body('discount') discount?: number,
  ) {
    return this.service.renew(id, staffId, discount);
  }
}
