import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { MembershipPlansModule } from './membership-plans/membership-plans.module';
import { MembershipsModule } from './memberships/memberships.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ClassesModule } from './classes/classes.module';
import { BookingsModule } from './bookings/bookings.module';
import { TrainersModule } from './trainers/trainers.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { GymsModule } from './gyms/gyms.module';
import { BranchesModule } from './branches/branches.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { UploadsModule } from './uploads/uploads.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TrainingContentModule } from './training-content/training-content.module';
import { EventsModule } from './events/events.module';
import { AccessModule } from './access/access.module';
import { EquipmentModule } from './equipment/equipment.module';
import { InventoryModule } from './inventory/inventory.module';
import { PosModule } from './pos/pos.module';
import { PtSessionsModule } from './pt-sessions/pt-sessions.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long', ttl: 60000, limit: 300 },
    ]),

    // Scheduling & events
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Core
    PrismaModule,
    EventsModule,

    // Feature modules
    AuthModule,
    UsersModule,
    GymsModule,
    BranchesModule,
    MembersModule,
    MembershipPlansModule,
    MembershipsModule,
    AttendanceModule,
    ClassesModule,
    BookingsModule,
    TrainersModule,
    PaymentsModule,
    NotificationsModule,
    ReportsModule,
    WorkoutsModule,
    UploadsModule,
    DashboardModule,
    TrainingContentModule,
    AccessModule,
    EquipmentModule,
    InventoryModule,
    PosModule,
    PtSessionsModule,
    AiModule,
  ],
})
export class AppModule {}
