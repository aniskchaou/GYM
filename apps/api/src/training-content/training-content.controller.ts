import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TrainingContentService } from './training-content.service';
import { CreateTrainingContentDto, UpdateTrainingContentDto, QueryTrainingContentDto } from './dto/training-content.dto';

@ApiTags('training-content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('training-content')
export class TrainingContentController {
  constructor(private readonly service: TrainingContentService) {}

  // ── Trainer endpoints ────────────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TRAINER', 'GYM_OWNER', 'BRANCH_MANAGER')
  @ApiOperation({ summary: 'Create training content (trainer/owner)' })
  create(@CurrentUser() user: any, @Body() dto: CreateTrainingContentDto) {
    return this.service.create(user.id, dto);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('TRAINER', 'GYM_OWNER', 'BRANCH_MANAGER')
  @ApiOperation({ summary: 'Get trainer own content library' })
  findMine(@CurrentUser() user: any) {
    return this.service.findMyContent(user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('TRAINER', 'GYM_OWNER', 'BRANCH_MANAGER')
  @ApiOperation({ summary: 'Update content' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateTrainingContentDto) {
    return this.service.update(id, user.id, dto);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles('TRAINER', 'GYM_OWNER', 'BRANCH_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish content' })
  publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.publish(id, user.id);
  }

  @Post(':id/unpublish')
  @UseGuards(RolesGuard)
  @Roles('TRAINER', 'GYM_OWNER', 'BRANCH_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish content' })
  unpublish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.unpublish(id, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('TRAINER', 'GYM_OWNER', 'BRANCH_MANAGER')
  @ApiOperation({ summary: 'Delete content' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.id);
  }

  // ── Public / Member endpoints ─────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Browse published content (all roles)' })
  findAll(@Query() query: QueryTrainingContentDto) {
    return this.service.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List available content categories' })
  getCategories() {
    return this.service.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single content item' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track view / progress' })
  trackView(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('progress') progress = 0,
  ) {
    return this.service.trackView(id, user.id, progress);
  }
}
