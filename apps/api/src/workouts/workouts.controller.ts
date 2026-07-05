import { Controller, Delete, Get, Param, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkoutsService } from './workouts.service';

@ApiTags('workouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private service: WorkoutsService) {}

  @Get()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({ summary: 'List exercises (workout library)' })
  findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }

  @Get('exercises')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({ summary: 'List workout exercises' })
  listExercises(@Query('category') category?: string) {
    return this.service.findAll(category);
  }

  @Get('plans')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN, UserRole.TRAINER, UserRole.MEMBER)
  @ApiOperation({ summary: 'List workout plans' })
  listPlans(@CurrentUser() user: any) {
    return this.service.listPlans(user);
  }

  @Post('plans')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Create workout plan' })
  createPlan(@Body() dto: any) {
    return this.service.createPlan(dto);
  }

  @Delete('plans/:id')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: 'Delete workout plan' })
  deletePlan(@Param('id') id: string) {
    return this.service.deletePlan(id);
  }
}
