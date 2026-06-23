import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EnrollmentStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProgramsService } from './programs.service';

@ApiTags('Programs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('programs')
export class ProgramsController {
  constructor(private service: ProgramsService) {}

  @Get()
  list(@CurrentUser('gymId') gymId: string, @Query('drafts') drafts?: string) {
    return this.service.list(gymId, drafts === 'true');
  }

  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.service.myEnrollments(userId);
  }

  @Get(':id')
  get(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.get(gymId, id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  create(@CurrentUser('gymId') gymId: string, @CurrentUser('id') authorId: string, @Body() dto: any) {
    return this.service.create(gymId, authorId, dto);
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

  @Post(':id/days')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  upsertDay(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.upsertDay(gymId, id, dto);
  }

  @Delete(':id/days/:dayId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  deleteDay(
    @CurrentUser('gymId') gymId: string,
    @Param('id') id: string,
    @Param('dayId') dayId: string,
  ) {
    return this.service.deleteDay(gymId, id, dayId);
  }

  @Post(':id/enroll')
  enroll(@CurrentUser('gymId') gymId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.enroll(gymId, userId, id);
  }

  @Post(':id/advance')
  advance(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.advance(userId, id);
  }

  @Post(':id/status')
  setStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { status: EnrollmentStatus },
  ) {
    return this.service.setStatus(userId, id, dto.status);
  }
}
