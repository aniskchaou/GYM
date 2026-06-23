import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActivitiesService } from './activities.service';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private service: ActivitiesService) {}

  @Get()
  list(@CurrentUser('gymId') gymId: string) {
    return this.service.list(gymId);
  }

  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.service.myActivities(userId);
  }

  @Get(':id')
  get(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.get(gymId, id);
  }

  @Get(':id/leaderboard')
  leaderboard(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.leaderboard(gymId, id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  create(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.create(gymId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  update(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(gymId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  remove(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.remove(gymId, id);
  }

  @Post(':id/join')
  join(@CurrentUser('gymId') gymId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.join(gymId, userId, id);
  }

  @Post(':id/progress')
  progress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { progress: number; submission?: any },
  ) {
    return this.service.submitProgress(userId, id, dto);
  }
}
