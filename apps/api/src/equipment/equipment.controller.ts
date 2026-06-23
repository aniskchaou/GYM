import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EquipmentService } from './equipment.service';

@ApiTags('Equipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipment')
export class EquipmentController {
  constructor(private service: EquipmentService) {}

  @Get()
  list(@CurrentUser('gymId') gymId: string) {
    return this.service.list(gymId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
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

  @Post(':id/maintenance')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  maintenance(
    @CurrentUser('gymId') gymId: string,
    @Param('id') id: string,
    @Body() dto: { on: boolean },
  ) {
    return this.service.setMaintenance(gymId, id, !!dto.on);
  }

  @Get('bookings')
  bookings(@CurrentUser('gymId') gymId: string, @Query('equipmentId') equipmentId?: string) {
    return this.service.listBookings(gymId, equipmentId);
  }

  @Post('bookings')
  book(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { equipmentId: string; startTime: string; durationMinutes?: number },
  ) {
    return this.service.book(gymId, userId, dto);
  }

  @Post('bookings/:id/cancel')
  cancel(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.cancel(gymId, userId, id);
  }

  @Get('bookings/mine')
  mine(@CurrentUser('id') userId: string) {
    return this.service.myBookings(userId);
  }
}
