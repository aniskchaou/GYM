import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PtSessionsService } from './pt-sessions.service';

@ApiTags('PT Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pt-sessions')
export class PtSessionsController {
  constructor(private service: PtSessionsService) {}

  @Get()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER, UserRole.MEMBER, UserRole.SUPER_ADMIN)
  list(@CurrentUser() user: any) {
    return this.service.list(user);
  }

  @Post()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER, UserRole.SUPER_ADMIN)
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER, UserRole.SUPER_ADMIN)
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER, UserRole.SUPER_ADMIN)
  complete(@Param('id') id: string, @Body() dto: { trainerNotes?: string }) {
    return this.service.complete(id, dto?.trainerNotes);
  }
}
