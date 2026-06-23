import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('kpis')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Dashboard KPIs (members, revenue, churn, check-ins)' })
  kpis(@CurrentUser('gymId') gymId: string) {
    return this.service.getDashboardKpis(gymId);
  }

  @Get('revenue-chart')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Monthly revenue chart' })
  revenueChart(
    @CurrentUser('gymId') gymId: string,
    @Query('months') months: number,
  ) {
    return this.service.getRevenueChart(gymId, months || 6);
  }

  @Get('member-growth')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Member growth chart' })
  memberGrowth(@CurrentUser('gymId') gymId: string, @Query('months') months: number) {
    return this.service.getMemberGrowthChart(gymId, months || 6);
  }

  @Get('attendance-heatmap')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Attendance heatmap (day × hour)' })
  heatmap(@CurrentUser('gymId') gymId: string) {
    return this.service.getAttendanceHeatmap(gymId);
  }

  @Get('top-classes')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Top 10 most booked classes' })
  topClasses(@CurrentUser('gymId') gymId: string) {
    return this.service.getTopClasses(gymId);
  }
}
