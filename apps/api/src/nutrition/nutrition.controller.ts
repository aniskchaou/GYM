import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NutritionService } from './nutrition.service';

@ApiTags('Nutrition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private service: NutritionService) {}

  // Foods
  @Get('foods')
  searchFoods(@Query('q') q?: string) {
    return this.service.searchFoods(q);
  }

  @Post('foods')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  createFood(@Body() dto: any) {
    return this.service.createFood(dto);
  }

  // Meal plans
  @Get('plans/mine')
  mine(@CurrentUser('id') userId: string) {
    return this.service.listForMember(userId);
  }

  @Get('plans/authored')
  authored(@CurrentUser('id') userId: string) {
    return this.service.listAuthored(userId);
  }

  @Get('plans/:id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post('plans')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  create(@CurrentUser('id') authorId: string, @CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.create(authorId, gymId, dto);
  }

  @Patch('plans/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete('plans/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('plans/:id/days')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  upsertDay(@Param('id') id: string, @Body() dto: { dayNumber: number }) {
    return this.service.upsertDay(id, dto);
  }

  @Post('days/:dayId/meals')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  addMeal(@Param('dayId') dayId: string, @Body() dto: any) {
    return this.service.addMeal(dayId, dto);
  }

  @Delete('meals/:mealId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.TRAINER)
  removeMeal(@Param('mealId') mealId: string) {
    return this.service.removeMeal(mealId);
  }
}
