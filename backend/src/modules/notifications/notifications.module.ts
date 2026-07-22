import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  PlatformNotification,
  NotificationSchema,
} from './schemas/notification.schema';
import { Store, StoreSchema } from '../stores/schemas/store.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlatformNotification.name, schema: NotificationSchema },
      { name: Store.name, schema: StoreSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
