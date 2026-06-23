import { Module } from '@nestjs/common';
import { PtSessionsService } from './pt-sessions.service';
import { PtSessionsController } from './pt-sessions.controller';

@Module({
  providers: [PtSessionsService],
  controllers: [PtSessionsController],
  exports: [PtSessionsService],
})
export class PtSessionsModule {}
