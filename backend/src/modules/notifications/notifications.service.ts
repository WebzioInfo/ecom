import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, PlatformNotification, NotificationType } from '@prisma/client';
import { StoreStatus } from '@prisma/public-client';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNotificationDto): Promise<PlatformNotification> {
    return this.prisma.client.platformNotification.create({
      data: {
        ...createDto,
        type: createDto.type as NotificationType,
        storeId: createDto.storeId || null,
      } as any
    });
  }

  async getStoreNotifications(storeId: string): Promise<PlatformNotification[]> {
    return this.prisma.client.platformNotification.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async getGlobalNotifications(): Promise<PlatformNotification[]> {
    return this.prisma.client.platformNotification.findMany({
      where: { storeId: null },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async markAsRead(id: string): Promise<PlatformNotification | null> {
    try {
      return await this.prisma.client.platformNotification.update({
        where: { id },
        data: { isRead: true }
      });
    } catch {
      return null;
    }
  }

  async markAllAsRead(storeId: string): Promise<{ modifiedCount: number }> {
    const result = await this.prisma.client.platformNotification.updateMany({
      where: { storeId, isRead: false },
      data: { isRead: true }
    });
    return { modifiedCount: result.count };
  }

  @Cron('0 0 * * *')
  async checkExpiringSubscriptions() {
    this.logger.log('Running daily subscription check...');
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // In prisma, subscription is a JSON field on Store.
    // We fetch all active stores and parse the subscription field manually.
    const activeStores = await this.prisma.client.store.findMany({
      where: { status: StoreStatus.ACTIVE }
    });

    for (const store of activeStores) {
      const sub = store.subscription as any;
      if (!sub || !sub.renewalDate) continue;

      const renewalDate = new Date(sub.renewalDate);

      if (renewalDate >= today && renewalDate <= threeDaysFromNow) {
        await this.create({
          title: 'Subscription Expiring Soon',
          message: `Your subscription will renew/expire on ${renewalDate.toLocaleDateString()}. Please ensure your payment method is up to date.`,
          type: NotificationType.WARNING,
          storeId: store.id,
        } as any);
      } else if (renewalDate < today) {
        await this.create({
          title: 'Subscription Expired',
          message: 'Your subscription has expired. Some features may be restricted until payment is updated.',
          type: NotificationType.ERROR,
          storeId: store.id,
        } as any);
      }
    }
  }
}
