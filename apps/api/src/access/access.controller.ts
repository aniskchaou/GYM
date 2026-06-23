import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessService } from './access.service';

@ApiTags('Access')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('access')
export class AccessController {
  constructor(private service: AccessService) {}

  /** Public-ish scan endpoint (staff/door device). */
  @Post('scan')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.GYM_OWNER,
    UserRole.BRANCH_MANAGER,
    UserRole.RECEPTIONIST,
  )
  scan(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('branchId') branchId: string | null,
    @CurrentUser('id') staffId: string,
    @Body() dto: { qrCode: string; direction?: 'IN' | 'OUT'; deviceId?: string; override?: boolean },
  ) {
    return this.service.scan({
      qrCode: dto.qrCode,
      gymId,
      branchId,
      direction: dto.direction,
      deviceId: dto.deviceId,
      overrideBy: dto.override ? staffId : null,
    });
  }

  @Get('my-qr')
  myQr(@CurrentUser('id') userId: string, @Query('rotate') rotate?: string) {
    return this.service.myQrCode(userId, rotate === 'true');
  }

  @Get('logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  logs(@CurrentUser('gymId') gymId: string, @Query('take') take?: string) {
    return this.service.listLogs(gymId, Number(take) || 100);
  }
}
