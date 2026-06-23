import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ENTITY_FROM_PATH: Array<[RegExp, string]> = [
  [/^\/?members/, 'Member'],
  [/^\/?trainers/, 'Trainer'],
  [/^\/?branches/, 'Branch'],
  [/^\/?classes/, 'Class'],
  [/^\/?bookings/, 'Booking'],
  [/^\/?memberships/, 'Membership'],
  [/^\/?membership-plans/, 'MembershipPlan'],
  [/^\/?payments/, 'Payment'],
  [/^\/?coupons/, 'Coupon'],
  [/^\/?pos\/orders/, 'Order'],
  [/^\/?pos\/products/, 'Product'],
  [/^\/?workouts/, 'WorkoutPlan'],
  [/^\/?pt-sessions/, 'PtSession'],
  [/^\/?attendance/, 'Attendance'],
  [/^\/?gyms/, 'Gym'],
  [/^\/?notifications/, 'Notification'],
];

function detectEntity(url: string): string {
  const clean = url.split('?')[0].replace(/^\/api\//, '/');
  for (const [re, name] of ENTITY_FROM_PATH) if (re.test(clean.replace(/^\//, ''))) return name;
  return 'Unknown';
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): any {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;
    if (method === 'GET' || method === 'OPTIONS' || method === 'HEAD') return next.handle();
    const user = req.user;
    if (!user?.id) return next.handle();

    const url: string = req.originalUrl ?? req.url ?? '';
    const entity = detectEntity(url);
    const action = `${method} ${url}`;
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const userAgent = req.headers['user-agent'] as string | undefined;

    const stream: any = next.handle();
    const writeAudit = (result: any) => {
      const entityId = (typeof result === 'object' && result?.id) || req.params?.id || null;
      this.prisma.auditLog.create({
        data: {
          userId: user.id,
          gymId: user.gymId ?? null,
          action,
          entity,
          entityId,
          newValues: this.safeBody(req.body),
          ipAddress,
          userAgent,
        },
      }).catch((e) => this.logger.warn(`AuditLog write failed: ${e.message}`));
    };
    // Use rxjs `tap` operator dynamically to avoid a static rxjs import
    // (rxjs is provided transitively by @nestjs/common).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { tap } = require('rxjs');
    return stream.pipe(tap({ next: writeAudit }));
  }

  private safeBody(body: any): any {
    if (!body || typeof body !== 'object') return null;
    const clone: any = {};
    for (const k of Object.keys(body)) {
      if (/password|token|secret/i.test(k)) continue;
      clone[k] = body[k];
    }
    return clone;
  }
}
