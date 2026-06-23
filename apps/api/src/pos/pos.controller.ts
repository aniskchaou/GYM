import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PosService } from './pos.service';

@ApiTags('POS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pos')
export class PosController {
  constructor(private service: PosService) {}

  // ────── Products ──────
  @Get('products')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN)
  listProducts(@CurrentUser('gymId') gymId: string) {
    return this.service.listProducts(gymId);
  }

  @Post('products')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  createProduct(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.createProduct(gymId, dto);
  }

  @Patch('products/:id')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN)
  updateProduct(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateProduct(gymId, id, dto);
  }

  @Delete('products/:id')
  @Roles(UserRole.GYM_OWNER, UserRole.SUPER_ADMIN)
  removeProduct(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.removeProduct(gymId, id);
  }

  // ────── Orders ──────
  @Get('orders')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN)
  listOrders(@CurrentUser('gymId') gymId: string) {
    return this.service.listOrders(gymId);
  }

  @Post('orders')
  @Roles(UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST, UserRole.SUPER_ADMIN)
  createOrder(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: any,
  ) {
    // Fall back to the staff user as the customer for walk-in sales
    const customerId = dto.customerId ?? dto.memberId ?? userId;
    return this.service.createOrder(gymId, { ...dto, customerId });
  }
}
