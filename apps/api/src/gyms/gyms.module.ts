import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { GymsService } from './gyms.service';
import { GymsController } from './gyms.controller';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.register({}),
  ],
  providers: [GymsService],
  controllers: [GymsController],
  exports: [GymsService],
})
export class GymsModule {}
