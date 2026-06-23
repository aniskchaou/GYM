import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InsightType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private service: AiService) {}

  // Insights
  @Get('insights')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  list(@CurrentUser('gymId') gymId: string, @Query('type') type?: InsightType) {
    return this.service.listInsights(gymId, type);
  }

  @Post('insights/run')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
  run(@CurrentUser('gymId') gymId: string) {
    return this.service.runScoring(gymId);
  }

  // Diet plans (any authenticated user can generate for themselves)
  @Post('diet/generate')
  generateDiet(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.generateDietPlan(userId, dto);
  }

  @Get('diet/mine')
  myDiet(@CurrentUser('id') userId: string) {
    return this.service.myDietPlans(userId);
  }
}
