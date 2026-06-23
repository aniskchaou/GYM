import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StockMoveType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get('suppliers')
  suppliers(@CurrentUser('gymId') gymId: string) {
    return this.service.listSuppliers(gymId);
  }

  @Post('suppliers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  createSupplier(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.createSupplier(gymId, dto);
  }

  @Patch('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  updateSupplier(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateSupplier(gymId, id, dto);
  }

  @Delete('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  deleteSupplier(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.deleteSupplier(gymId, id);
  }

  @Get('movements')
  movements(@CurrentUser('gymId') gymId: string, @Query('productId') productId?: string) {
    return this.service.listMovements(gymId, productId);
  }

  @Post('movements')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.RECEPTIONIST)
  recordMovement(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { productId: string; type: StockMoveType; quantity: number; reason?: string; reference?: string },
  ) {
    return this.service.recordMovement(gymId, userId, dto);
  }

  @Get('low-stock')
  lowStock(@CurrentUser('gymId') gymId: string) {
    return this.service.scanLowStock(gymId);
  }
}
