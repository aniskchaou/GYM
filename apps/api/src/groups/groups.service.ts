import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GroupVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  list(gymId: string) {
    return this.prisma.communityGroup.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true, posts: true } } },
    });
  }

  get(gymId: string, id: string, userId?: string) {
    return this.prisma.communityGroup.findFirst({
      where: { id, gymId },
      include: {
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        },
        _count: { select: { posts: true } },
      },
    });
  }

  create(gymId: string, userId: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.communityGroup.create({
        data: {
          gymId,
          name: dto.name,
          description: dto.description ?? null,
          visibility: dto.visibility ?? GroupVisibility.PUBLIC,
          imageUrl: dto.imageUrl ?? null,
        },
      });
      await tx.groupMember.create({
        data: { groupId: group.id, userId, role: 'admin' },
      });
      return group;
    });
  }

  async update(gymId: string, userId: string, id: string, dto: any) {
    await this.ensureAdmin(gymId, id, userId);
    return this.prisma.communityGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.visibility !== undefined && { visibility: dto.visibility }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
    });
  }

  async remove(gymId: string, userId: string, id: string) {
    await this.ensureAdmin(gymId, id, userId);
    await this.prisma.groupComment.deleteMany({ where: { post: { groupId: id } } });
    await this.prisma.groupPost.deleteMany({ where: { groupId: id } });
    await this.prisma.groupMember.deleteMany({ where: { groupId: id } });
    await this.prisma.communityGroup.delete({ where: { id } });
    return { success: true };
  }

  async join(gymId: string, userId: string, id: string) {
    const group = await this.prisma.communityGroup.findFirst({ where: { id, gymId } });
    if (!group) throw new NotFoundException('Group not found');
    try {
      return await this.prisma.groupMember.create({
        data: { groupId: id, userId, role: 'member' },
      });
    } catch {
      throw new BadRequestException('Already a member');
    }
  }

  async leave(userId: string, id: string) {
    await this.prisma.groupMember.deleteMany({ where: { groupId: id, userId } });
    return { success: true };
  }

  async listPosts(gymId: string, groupId: string) {
    return this.prisma.groupPost.findMany({
      where: { groupId, group: { gymId } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });
  }

  async createPost(gymId: string, userId: string, groupId: string, dto: { content: string; imageUrl?: string }) {
    await this.ensureMember(gymId, groupId, userId);
    return this.prisma.groupPost.create({
      data: {
        groupId,
        authorId: userId,
        content: dto.content,
        imageUrl: dto.imageUrl ?? null,
      },
    });
  }

  async deletePost(gymId: string, userId: string, postId: string) {
    const post = await this.prisma.groupPost.findUnique({
      where: { id: postId },
      include: { group: true },
    });
    if (!post || post.group.gymId !== gymId) throw new NotFoundException('Post not found');
    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: post.groupId, userId } },
    });
    if (post.authorId !== userId && membership?.role !== 'admin') {
      throw new ForbiddenException('Cannot delete this post');
    }
    await this.prisma.groupComment.deleteMany({ where: { postId } });
    await this.prisma.groupPost.delete({ where: { id: postId } });
    return { success: true };
  }

  async listComments(postId: string) {
    return this.prisma.groupComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  async addComment(userId: string, postId: string, content: string) {
    const post = await this.prisma.groupPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    return this.prisma.groupComment.create({
      data: { postId, authorId: userId, content },
    });
  }

  private async ensureMember(gymId: string, groupId: string, userId: string) {
    const group = await this.prisma.communityGroup.findFirst({ where: { id: groupId, gymId } });
    if (!group) throw new NotFoundException('Group not found');
    const m = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!m) throw new ForbiddenException('Not a member');
    return m;
  }

  private async ensureAdmin(gymId: string, groupId: string, userId: string) {
    const m = await this.ensureMember(gymId, groupId, userId);
    if (m.role !== 'admin') throw new ForbiddenException('Admin only');
  }
}
