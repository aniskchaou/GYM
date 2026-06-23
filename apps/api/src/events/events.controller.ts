import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  list(
    @CurrentUser('gymId') gymId: string,
    @Query('name') name?: string,
    @Query('take') take = '100',
  ) {
    return this.prisma.systemEvent.findMany({
      where: { gymId, ...(name ? { name } : {}) },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(take) || 100, 500),
    });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  async stats(@CurrentUser('gymId') gymId: string) {
    const rows = await this.prisma.systemEvent.groupBy({
      by: ['name'],
      where: { gymId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600_000) } },
      _count: { _all: true },
    });
    return rows.map((r) => ({ name: r.name, count: r._count._all }));
  }
}
