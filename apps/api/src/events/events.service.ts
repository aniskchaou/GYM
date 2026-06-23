import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { APP_EVENTS, AppEventName, BaseEventPayload } from './events.types';

/**
 * Thin wrapper around EventEmitter2 that also persists every emission to the
 * SystemEvent table so we have an audit-quality replayable stream of user activity.
 * Other services should depend on this rather than EventEmitter2 directly.
 */
@Injectable()
export class AppEventsService {
  private readonly logger = new Logger(AppEventsService.name);

  constructor(private prisma: PrismaService, private bus: EventEmitter2) {}

  async emit<P extends BaseEventPayload>(name: AppEventName, payload: P): Promise<void> {
    const enriched = { ...payload, at: payload.at ?? new Date(), name };
    // Persist (best-effort: don't break business flow if it fails)
    try {
      await this.prisma.systemEvent.create({
        data: {
          name,
          gymId: payload.gymId ?? null,
          userId: payload.userId ?? null,
          payload: payload.meta ?? {},
        },
      });
    } catch (e: any) {
      this.logger.warn(`SystemEvent persist failed for ${name}: ${e?.message}`);
    }
    this.bus.emit(name, enriched);
  }

  /** Re-export for listeners */
  static EVENTS = APP_EVENTS;
}

/**
 * Sample listener — keeps a lightweight stat counter; concrete features
 * (loyalty, marketing) add their own listeners targeting specific events.
 */
@Injectable()
export class CoreEventListeners {
  private readonly logger = new Logger('AppEvents');

  @OnEvent('**')
  onAny(payload: any) {
    if (typeof payload?.name === 'string') {
      this.logger.debug(`event: ${payload.name}`);
    }
  }
}
