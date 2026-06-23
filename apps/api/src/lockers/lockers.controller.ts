import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LockersService } from './lockers.service';

@ApiTags('Lockers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lockers')
export class LockersController {
  constructor(private service: LockersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
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

  /** Member books a locker (auto-assign if no lockerId). */
  @Post('book')
  book(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { lockerId?: string; expectedMinutes?: number },
  ) {
    return this.service.book(gymId, userId, dto);
  }

  @Post(':bookingId/release')
  release(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.service.release(gymId, userId, bookingId);
  }

  @Post('unlock')
  unlock(@Body() dto: { lockerId: string; token: string }) {
    return this.service.unlock(dto);
  }

  @Post('sweep-abandoned')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  sweep(@CurrentUser('gymId') gymId: string) {
    return this.service.sweepAbandoned(gymId);
  }

  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.service.myBookings(userId);
  }
}
