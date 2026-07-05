import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationChannel, NotificationStatus, UserRole } from '@prisma/client';
import { SendNotificationDto } from './dto/send-notification.dto';
import { MailService } from '../common/mail.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async listForUser(userId: string) {
    const items = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return items.map((n) => ({
      ...n,
      isRead: n.status === NotificationStatus.READ,
      title: n.subject,
      message: n.body,
      type: 'INFO',
    }));
  }

  async markRead(id: string, userId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.userId !== userId) throw new ForbiddenException();
    return this.prisma.notification.update({
      where: { id },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, status: { not: NotificationStatus.READ } },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    });
    return { ok: true };
  }

  async remove(id: string, userId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.userId !== userId) throw new ForbiddenException();
    await this.prisma.notification.delete({ where: { id } });
    return { ok: true };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, status: { not: NotificationStatus.READ } },
    });
    return { count };
  }

  async send(gymId: string, dto: SendNotificationDto) {
    let recipientIds: string[] = dto.userIds ?? [];
    let recipientEmails: string[] = [];

    if (!recipientIds.length) {
      const audience = dto.audience ?? 'members';
      const roleFilter =
        audience === 'staff'
          ? { in: [UserRole.RECEPTIONIST, UserRole.TRAINER, UserRole.BRANCH_MANAGER] }
          : audience === 'all'
            ? undefined
            : { equals: UserRole.MEMBER };

      const recipients = await this.prisma.user.findMany({
        where: { gymId, ...(roleFilter ? { role: roleFilter } : {}) },
        select: { id: true, email: true },
      });
      recipientIds = recipients.map((u) => u.id);
      recipientEmails = recipients.map((u) => u.email).filter(Boolean);
    } else {
      const recipients = await this.prisma.user.findMany({
        where: { id: { in: recipientIds }, gymId },
        select: { email: true },
      });
      recipientEmails = recipients.map((u) => u.email).filter(Boolean);
    }

    if (!recipientIds.length) return { sent: 0 };

    const now = new Date();
    await this.prisma.notification.createMany({
      data: recipientIds.map((uid) => ({
        userId: uid,
        channel: dto.channel ?? NotificationChannel.IN_APP,
        status: NotificationStatus.SENT,
        subject: dto.subject,
        body: dto.body,
        sentAt: now,
      })),
    });

    let emailResult: { sent: number; failed: number } | undefined;
    if ((dto.channel ?? NotificationChannel.IN_APP) === NotificationChannel.EMAIL && recipientEmails.length) {
      emailResult = await this.mail.sendBulk(
        recipientEmails.map((to) => ({
          to,
          subject: dto.subject,
          text: dto.body,
          html: `<p>${dto.body}</p>`,
        })),
      );
    }

    return { sent: recipientIds.length, email: emailResult };
  }
}
