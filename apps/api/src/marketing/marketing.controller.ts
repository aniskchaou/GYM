import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SegmentKey, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MarketingService } from './marketing.service';

@ApiTags('Marketing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER)
@Controller('marketing')
export class MarketingController {
  constructor(private service: MarketingService) {}

  @Get('campaigns')
  list(@CurrentUser('gymId') gymId: string) {
    return this.service.list(gymId);
  }

  @Get('campaigns/:id')
  get(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.get(gymId, id);
  }

  @Post('campaigns')
  create(@CurrentUser('gymId') gymId: string, @Body() dto: any) {
    return this.service.create(gymId, dto);
  }

  @Patch('campaigns/:id')
  update(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(gymId, id, dto);
  }

  @Delete('campaigns/:id')
  remove(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.remove(gymId, id);
  }

  @Post('campaigns/:id/send')
  send(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.send(gymId, id);
  }

  @Get('segment/preview')
  preview(@CurrentUser('gymId') gymId: string, @Query('segment') segment: SegmentKey) {
    return this.service.segmentUsers(gymId, segment);
  }

  @Post('trigger')
  trigger(@CurrentUser('gymId') gymId: string, @Body() dto: { trigger: string }) {
    return this.service.runTrigger(gymId, dto.trigger);
  }
}
