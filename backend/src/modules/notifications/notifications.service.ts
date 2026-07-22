import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import {
  PlatformNotification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  Store,
  StoreDocument,
  StoreStatus,
} from '../stores/schemas/store.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(PlatformNotification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}

  async create(
    createDto: CreateNotificationDto,
  ): Promise<PlatformNotification> {
    const notification = new this.notificationModel({
      ...createDto,
      storeId: createDto.storeId
        ? new Types.ObjectId(createDto.storeId)
        : undefined,
    });
    return notification.save();
  }

  async getStoreNotifications(
    storeId: string,
  ): Promise<PlatformNotification[]> {
    return this.notificationModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async getGlobalNotifications(): Promise<PlatformNotification[]> {
    return this.notificationModel
      .find({ storeId: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(id: string): Promise<PlatformNotification | null> {
    return this.notificationModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .exec();
  }

  async markAllAsRead(storeId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { storeId: new Types.ObjectId(storeId), isRead: false },
      { $set: { isRead: true } },
    );
    return { modifiedCount: result.modifiedCount };
  }

  // CRON JOBS for Automated Notifications

  // Runs every day at midnight to check expiring subscriptions
  @Cron('0 0 * * *') // EVERY_DAY_AT_MIDNIGHT
  async checkExpiringSubscriptions() {
    this.logger.log('Running daily subscription check...');
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Find active stores with subscription ending within 3 days
    const storesExpiringSoon = await this.storeModel
      .find({
        status: StoreStatus.ACTIVE,
        'subscription.renewalDate': {
          $gte: today,
          $lte: threeDaysFromNow,
        },
      })
      .exec();

    for (const store of storesExpiringSoon) {
      await this.create({
        title: 'Subscription Expiring Soon',
        message: `Your subscription will renew/expire on ${store.subscription?.renewalDate?.toLocaleDateString() ?? 'soon'}. Please ensure your payment method is up to date.`,
        type: NotificationType.WARNING,
        storeId: store._id.toString(),
      });
    }

    // Find stores that have expired
    const expiredStores = await this.storeModel
      .find({
        status: StoreStatus.ACTIVE,
        'subscription.renewalDate': {
          $lt: today,
        },
      })
      .exec();

    for (const store of expiredStores) {
      await this.create({
        title: 'Subscription Expired',
        message:
          'Your subscription has expired. Some features may be restricted until payment is updated.',
        type: NotificationType.ERROR,
        storeId: store._id.toString(),
      });
      // Optionally auto-suspend them or downgrade plan here.
    }
  }
}
