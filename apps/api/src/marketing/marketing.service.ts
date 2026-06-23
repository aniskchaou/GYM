import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CampaignChannel, CampaignStatus, SegmentKey } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppEventsService } from '../events/events.service';
import { APP_EVENTS } from '../events/events.types';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService, private events: AppEventsService) {}

  list(gymId: string) {
    return this.prisma.marketingCampaign.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { sends: true } } },
    });
  }

  async get(gymId: string, id: string) {
    const c = await this.prisma.marketingCampaign.findFirst({
      where: { id, gymId },
      include: {
        sends: {
          take: 100,
          orderBy: { sentAt: 'desc' },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
    if (!c) throw new NotFoundException('Campaign not found');
    return c;
  }

  create(gymId: string, dto: any) {
    return this.prisma.marketingCampaign.create({
      data: {
        gymId,
        name: dto.name,
        subject: dto.subject ?? null,
        body: dto.body,
        channel: dto.channel as CampaignChannel,
        segment: dto.segment as SegmentKey,
        trigger: dto.trigger ?? null,
        status: dto.status ?? CampaignStatus.DRAFT,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
    });
  }

  async update(gymId: string, id: string, dto: any) {
    const c = await this.prisma.marketingCampaign.findFirst({ where: { id, gymId } });
    if (!c) throw new NotFoundException('Campaign not found');
    return this.prisma.marketingCampaign.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.subject !== undefined && { subject: dto.subject }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.channel !== undefined && { channel: dto.channel }),
        ...(dto.segment !== undefined && { segment: dto.segment }),
        ...(dto.trigger !== undefined && { trigger: dto.trigger }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.scheduledAt !== undefined && {
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        }),
      },
    });
  }

  async remove(gymId: string, id: string) {
    const c = await this.prisma.marketingCampaign.findFirst({ where: { id, gymId } });
    if (!c) throw new NotFoundException('Campaign not found');
    await this.prisma.campaignSend.deleteMany({ where: { campaignId: id } });
    await this.prisma.marketingCampaign.delete({ where: { id } });
    return { success: true };
  }

  /** Compute segment user list for preview / sending. */
  async segmentUsers(gymId: string, segment: SegmentKey) {
    const baseWhere = { gymId, isActive: true };
    const now = Date.now();
    const days = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

    switch (segment) {
      case SegmentKey.ALL:
        return this.prisma.user.findMany({ where: baseWhere, take: 5000 });
      case SegmentKey.ACTIVE:
        return this.prisma.user.findMany({
          where: { ...baseWhere, attendances: { some: { checkedInAt: { gte: days(14) } } } },
          take: 5000,
        });
      case SegmentKey.INACTIVE_7D:
        return this.prisma.user.findMany({
          where: { ...baseWhere, attendances: { none: { checkedInAt: { gte: days(7) } } } },
          take: 5000,
        });
      case SegmentKey.INACTIVE_30D:
        return this.prisma.user.findMany({
          where: { ...baseWhere, attendances: { none: { checkedInAt: { gte: days(30) } } } },
          take: 5000,
        });
      case SegmentKey.CHURN_RISK:
        return this.prisma.user.findMany({
          where: { ...baseWhere, attendances: { none: { checkedInAt: { gte: days(21) } } } },
          take: 5000,
        });
      case SegmentKey.EXPIRING_7D: {
        const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return this.prisma.user.findMany({
          where: {
            ...baseWhere,
            memberships: {
              some: { status: 'ACTIVE', endDate: { gte: new Date(), lte: in7 } },
            },
          },
          take: 5000,
        });
      }
      case SegmentKey.NEW_MEMBERS_30D:
        return this.prisma.user.findMany({
          where: { ...baseWhere, createdAt: { gte: days(30) } },
          take: 5000,
        });
      case SegmentKey.HIGH_VALUE:
        return this.prisma.user.findMany({
          where: { ...baseWhere },
          orderBy: { createdAt: 'asc' },
          take: 200,
        });
      case SegmentKey.TRIAL:
        return this.prisma.user.findMany({
          where: { ...baseWhere, memberships: { none: {} } },
          take: 5000,
        });
      default:
        return [];
    }
  }

  async send(gymId: string, id: string) {
    const campaign = await this.prisma.marketingCampaign.findFirst({ where: { id, gymId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status === CampaignStatus.RUNNING) throw new BadRequestException('Already running');

    await this.prisma.marketingCampaign.update({
      where: { id },
      data: { status: CampaignStatus.RUNNING, startedAt: new Date() },
    });
    const users = await this.segmentUsers(gymId, campaign.segment);
    let sent = 0;
    for (const u of users) {
      try {
        await this.prisma.campaignSend.create({
          data: { campaignId: campaign.id, userId: u.id, status: 'SENT' },
        });
        sent++;
      } catch {
        /* skip duplicate */
      }
    }
    const completed = await this.prisma.marketingCampaign.update({
      where: { id },
      data: { status: CampaignStatus.COMPLETED, completedAt: new Date() },
    });
    await this.events.emit(APP_EVENTS.CAMPAIGN_SENT, {
      gymId,
      meta: { campaignId: id, sent, channel: campaign.channel, segment: campaign.segment },
    });
    return { campaign: completed, sent };
  }

  /** Automation listener — fires when any event matches a campaign trigger. */
  @OnEvent('**')
  async onAnyEvent(payload: any, eventName?: string) {
    // event-emitter passes event name implicitly; we can't get it without a listener wrapper.
    // Skip if no trigger automation desired.
  }

  /** Run triggered automations for an event name on demand. */
  async runTrigger(gymId: string, triggerName: string) {
    const campaigns = await this.prisma.marketingCampaign.findMany({
      where: { gymId, trigger: triggerName, status: CampaignStatus.SCHEDULED },
    });
    for (const c of campaigns) {
      await this.send(gymId, c.id);
    }
    return { fired: campaigns.length };
  }
}
