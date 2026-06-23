import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MembershipPlansService } from './membership-plans.service';

@ApiTags('membership-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('membership-plans')
export class MembershipPlansController {
  constructor(private service: MembershipPlansService) {}

  @Get()
  @Roles(
    UserRole.GYM_OWNER,
    UserRole.BRANCH_MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.SUPER_ADMIN,
    UserRole.MEMBER,
    UserRole.TRAINER,
  )
  @ApiOperation({ summary: 'List membership plans for a gym' })
  findAll(@CurrentUser('gymId') gymId: string, @Query() query: any) {
    return this.service.findAll(gymId, query);
  }

  @Post()
  @Roles(UserRole.GYM_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a membership plan' })
  create(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.create(gymId, dto);
  }
}
