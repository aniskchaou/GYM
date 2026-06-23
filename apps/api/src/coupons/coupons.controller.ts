import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CouponsService } from './coupons.service';

@ApiTags('Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private service: CouponsService) {}

  @Get()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN)
  list(@CurrentUser('gymId') gymId: string) {
    return this.service.list(gymId);
  }

  @Post()
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  create(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.create(gymId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  update(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(gymId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.GYM_OWNER, UserRole.SUPER_ADMIN)
  remove(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.remove(gymId, id);
  }

  @Post('validate')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.MEMBER, UserRole.SUPER_ADMIN)
  validate(@CurrentUser('gymId') gymId: string, @Body() dto: { code: string; amount: number }) {
    return this.service.validate(gymId, dto.code, dto.amount);
  }
}
