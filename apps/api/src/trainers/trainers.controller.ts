import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TrainersService } from './trainers.service';

@ApiTags('trainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trainers')
export class TrainersController {
  constructor(private service: TrainersService) {}

  @Get()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN, UserRole.MEMBER, UserRole.TRAINER)
  @ApiOperation({ summary: 'List all trainers for a gym' })
  findAll(@CurrentUser('gymId') gymId: string) {
    return this.service.findAll(gymId);
  }

  @Post()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a trainer' })
  create(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.create(gymId, dto);
  }

  // ─── Trainer self-service ────────────────────────────────────────

  @Get('my/clients')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'List members assigned to this trainer' })
  myClients(@CurrentUser('id') userId: string, @CurrentUser('gymId') gymId: string) {
    return this.service.getMyClients(userId, gymId);
  }

  @Get('my/profile')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Get my trainer profile' })
  myProfile(@CurrentUser('id') userId: string) {
    return this.service.getMyProfile(userId);
  }

  @Patch('my/profile')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Update my trainer profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.updateProfile(userId, dto);
  }

  @Post('my/assessment')
  @Roles(UserRole.TRAINER, UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Create a fitness assessment for a member' })
  createAssessment(
    @CurrentUser('id') trainerId: string,
    @Body() dto: { memberId: string; notes: string; goals: string[]; fitnessLevel: string; weight?: number; height?: number; bodyFat?: number },
  ) {
    return this.service.createAssessment(trainerId, dto);
  }

  @Get('my/assessments')
  @Roles(UserRole.TRAINER, UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'List assessments created by this trainer' })
  myAssessments(@CurrentUser('id') trainerId: string) {
    return this.service.getMyAssessments(trainerId);
  }

  @Post('my/message')
  @Roles(UserRole.TRAINER)
  @ApiOperation({ summary: 'Send a message to a member' })
  sendMessage(
    @CurrentUser('id') senderId: string,
    @Body() dto: { memberId: string; message: string },
  ) {
    return this.service.sendMessage(senderId, dto.memberId, dto.message);
  }
}
