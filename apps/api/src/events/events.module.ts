import { Global, Module } from '@nestjs/common';
import { AppEventsService, CoreEventListeners } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [EventsController],
  providers: [AppEventsService, CoreEventListeners],
  exports: [AppEventsService],
})
export class EventsModule {}
