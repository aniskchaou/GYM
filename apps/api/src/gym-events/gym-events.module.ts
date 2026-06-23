import { Module } from '@nestjs/common';
import { GymEventsController } from './gym-events.controller';
import { GymEventsService } from './gym-events.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GymEventsController],
  providers: [GymEventsService],
})
export class GymEventsModule {}
