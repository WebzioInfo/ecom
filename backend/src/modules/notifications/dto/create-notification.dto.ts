import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum NotificationCategory {
  SUBSCRIPTION = 'SUBSCRIPTION',
  BILLING = 'BILLING',
  PROVISIONING = 'PROVISIONING',
  SECURITY = 'SECURITY',
  STORAGE = 'STORAGE',
  API_USAGE = 'API_USAGE',
  PLANS = 'PLANS',
  ORDERS = 'ORDERS',
  PAYMENTS = 'PAYMENTS',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification Title', example: 'Trial Expiring Soon' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification Message Body' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.INFO })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ enum: NotificationCategory, default: NotificationCategory.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiPropertyOptional({ enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: 'Target Store ID' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ description: 'Recipient Role (SUPER_ADMIN, STORE_OWNER, TENANT_ADMIN)', default: 'SUPER_ADMIN' })
  @IsOptional()
  @IsString()
  recipientRole?: string;
}
