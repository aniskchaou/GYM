import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private service: GroupsService) {}

  @Get()
  list(@CurrentUser('gymId') gymId: string) {
    return this.service.list(gymId);
  }

  @Get(':id')
  get(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.get(gymId, id);
  }

  @Post()
  create(@CurrentUser('gymId') gymId: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.service.create(gymId, userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.service.update(gymId, userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('gymId') gymId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(gymId, userId, id);
  }

  @Post(':id/join')
  join(@CurrentUser('gymId') gymId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.join(gymId, userId, id);
  }

  @Post(':id/leave')
  leave(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.leave(userId, id);
  }

  @Get(':id/posts')
  posts(@CurrentUser('gymId') gymId: string, @Param('id') id: string) {
    return this.service.listPosts(gymId, id);
  }

  @Post(':id/posts')
  createPost(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { content: string; imageUrl?: string },
  ) {
    return this.service.createPost(gymId, userId, id, dto);
  }

  @Delete('posts/:postId')
  deletePost(
    @CurrentUser('gymId') gymId: string,
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ) {
    return this.service.deletePost(gymId, userId, postId);
  }

  @Get('posts/:postId/comments')
  comments(@Param('postId') postId: string) {
    return this.service.listComments(postId);
  }

  @Post('posts/:postId/comments')
  addComment(
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
    @Body() dto: { content: string },
  ) {
    return this.service.addComment(userId, postId, dto.content);
  }
}
