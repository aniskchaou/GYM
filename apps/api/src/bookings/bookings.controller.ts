import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private service: BookingsService) {}

  @Post('classes/:scheduleId')
  @Roles(UserRole.MEMBER, UserRole.RECEPTIONIST, UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Book a class' })
  bookClass(@Param('scheduleId') scheduleId: string, @CurrentUser('id') memberId: string) {
    return this.service.bookClass(memberId, scheduleId);
  }

  @Delete(':bookingId')
  @Roles(UserRole.MEMBER, UserRole.RECEPTIONIST, UserRole.GYM_OWNER)
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(@Param('bookingId') bookingId: string, @CurrentUser('id') memberId: string) {
    return this.service.cancelBooking(memberId, bookingId);
  }

  @Get('my')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: "Get current member's bookings" })
  myBookings(@CurrentUser('id') memberId: string) {
    return this.service.getMemberBookings(memberId);
  }

  @Get('classes/upcoming')
  @Roles(UserRole.MEMBER, UserRole.RECEPTIONIST, UserRole.GYM_OWNER, UserRole.TRAINER)
  @ApiOperation({ summary: 'List upcoming classes with availability' })
  upcoming(@CurrentUser('gymId') gymId: string) {
    return this.service.getUpcomingClasses(gymId);
  }
}
