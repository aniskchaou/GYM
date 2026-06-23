import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationChannel } from '@prisma/client';

export class SendNotificationDto {
  @ApiProperty({ required: false, description: 'List of recipient userIds. Omit to broadcast to all members.' })
  @IsOptional() @IsArray() userIds?: string[];

  @ApiProperty()
  @IsString() subject: string;

  @ApiProperty()
  @IsString() body: string;

  @ApiProperty({ enum: NotificationChannel, default: NotificationChannel.IN_APP, required: false })
  @IsOptional() @IsEnum(NotificationChannel) channel?: NotificationChannel;

  @ApiProperty({ required: false, default: 'all', description: 'all | members | staff' })
  @IsOptional() @IsString() audience?: 'all' | 'members' | 'staff';
}
