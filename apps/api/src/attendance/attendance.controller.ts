import { Controller, Post, Body, Param, Get, Query, UseGuards, Patch, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceMethod } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class CheckInDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() userId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() qrCode?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() rfidTag?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() query?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() branchId?: string;
  @ApiProperty({ enum: AttendanceMethod, default: AttendanceMethod.MANUAL })
  @IsEnum(AttendanceMethod) method: AttendanceMethod;
}

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Post('check-in')
  @Roles(UserRole.RECEPTIONIST, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Check in a member' })
  async checkIn(
    @CurrentUser('gymId') gymId: string,
    @Body() dto: CheckInDto,
  ) {
    // Auto-resolve branchId from gym if not provided
    let branchId = dto.branchId;
    if (!branchId) {
      const branch = await this.service.getFirstBranch(gymId);
      branchId = branch?.id;
    }
    if (!branchId) throw new BadRequestException('No branch found for this gym');
    return this.service.checkIn({ ...dto, branchId });
  }

  @Patch(':id/check-out')
  @Roles(UserRole.RECEPTIONIST, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Check out a member' })
  checkOut(@Param('id') id: string) {
    return this.service.checkOut(id);
  }

  @Get('occupancy/:branchId')
  @Roles(UserRole.RECEPTIONIST, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get real-time branch occupancy' })
  occupancy(@Param('branchId') branchId: string) {
    return this.service.getCurrentOccupancy(branchId);
  }

  @Get('report')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Attendance report for date range' })
  report(
    @CurrentUser('gymId') gymId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.service.getAttendanceReport(gymId, new Date(from), new Date(to));
  }
}
