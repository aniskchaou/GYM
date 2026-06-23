import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
}
