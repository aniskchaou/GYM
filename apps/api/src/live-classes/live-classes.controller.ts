import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LiveClassStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LiveClassesService } from './live-classes.service';

@ApiTags('Live Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('live-classes')
export class LiveClassesController {
  constructor(private service: LiveClassesService) {}

  @Get()
  list(@CurrentUser('gymId') gymId: string) {
    return this.service.list(gymId);
  }

  @Get(':id')
  get(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.get(gymId, id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  create(@CurrentUser('gymId') gymId: string, @CurrentUser('id') hostId: string, @Body() dto: any) {
    return this.service.create(gymId, hostId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  update(@CurrentUser('gymId') gymId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(gymId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER)
  remove(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.remove(gymId, id);
  }

  @Post(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GYM_OWNER, UserRole.BRANCH_MANAGER, UserRole.TRAINER)
  setStatus(
    @CurrentUser('gymId') gymId: string,
    @Param('id') id: string,
    @Body() dto: { status: LiveClassStatus },
  ) {
    return this.service.setStatus(gymId, id, dto.status);
  }

  @Post(':id/join')
  join(@CurrentUser('gymId') gymId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.join(gymId, userId, id);
  }

  @Post(':id/leave')
  leave(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.leave(userId, id);
  }

  @Get(':id/messages')
  messages(@Param('id') id: string) {
    return this.service.listMessages(id);
  }

  @Post(':id/messages')
  postMessage(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { content: string },
  ) {
    return this.service.postMessage(userId, id, dto.content);
  }
}
