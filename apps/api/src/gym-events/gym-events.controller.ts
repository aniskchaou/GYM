import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GymEventsService } from './gym-events.service';

@ApiTags('Gym Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gym-events')
export class GymEventsController {
  constructor(private service: GymEventsService) {}

  @Get()
  list(@CurrentUser('gymId') gymId: string) {
    return this.service.list(gymId);
  }

  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.service.myRegistrations(userId);
  }

  @Get(':id')
  get(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.get(gymId, id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  create(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.create(gymId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  update(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(gymId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  remove(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.remove(gymId, id);
  }

  @Post(':id/register')
  register(@CurrentUser('gymId') gymId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.register(gymId, userId, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.cancelRegistration(userId, id);
  }

  @Post('scan')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  scan(@CurrentUser('gymId') gymId: string, @Body() dto: { qrCode: string }) {
    return this.service.checkInQr(gymId, dto.qrCode);
  }
}
