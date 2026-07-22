import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = PlatformNotification & Document;

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
}

@Schema({ timestamps: true })
export class PlatformNotification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Prop({ type: Types.ObjectId, ref: 'Store', index: true })
  storeId?: Types.ObjectId; // If null, it's a global platform notification for super admin

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema =
  SchemaFactory.createForClass(PlatformNotification);
NotificationSchema.index({ storeId: 1, isRead: 1 });
