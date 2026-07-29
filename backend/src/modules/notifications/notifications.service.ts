import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto, NotificationType, NotificationCategory, NotificationPriority } from './dto/create-notification.dto';
import * as crypto from 'crypto';

export interface PlatformNotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  storeId?: string | null;
  recipientRole: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  createdAt: string;
  readAt?: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private globalNotifications: PlatformNotificationItem[] = [];

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<PlatformNotificationItem> {
    const notification: PlatformNotificationItem = {
      id: `NTF-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      title: dto.title,
      message: dto.message,
      type: dto.type || NotificationType.INFO,
      category: dto.category || NotificationCategory.SYSTEM,
      priority: dto.priority || NotificationPriority.MEDIUM,
      storeId: dto.storeId || null,
      recipientRole: dto.recipientRole || 'SUPER_ADMIN',
      status: 'UNREAD',
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    this.globalNotifications.unshift(notification);
    if (this.globalNotifications.length > 500) {
      this.globalNotifications = this.globalNotifications.slice(0, 500);
    }

    this.logger.log(`[Notification Created] [${notification.type}] ${notification.title}: ${notification.message}`);
    return notification;
  }

  async findAll(query: any = {}) {
    let result = [...this.globalNotifications];

    if (query.storeId) {
      result = result.filter((n) => n.storeId === query.storeId || !n.storeId);
    }
    if (query.status) {
      result = result.filter((n) => n.status === query.status);
    }
    if (query.type) {
      result = result.filter((n) => n.type === query.type);
    }

    return result;
  }

  async findOne(id: string) {
    const notif = this.globalNotifications.find((n) => n.id === id);
    if (!notif) throw new NotFoundException(`Notification #${id} not found.`);
    return notif;
  }

  async markAsRead(id: string) {
    const notif = await this.findOne(id);
    notif.status = 'READ';
    notif.readAt = new Date().toISOString();
    return notif;
  }

  async markAsArchived(id: string) {
    const notif = await this.findOne(id);
    notif.status = 'ARCHIVED';
    return notif;
  }

  async markAllAsRead(storeId?: string) {
    let count = 0;
    for (const notif of this.globalNotifications) {
      if ((!storeId || notif.storeId === storeId) && notif.status === 'UNREAD') {
        notif.status = 'READ';
        notif.readAt = new Date().toISOString();
        count++;
      }
    }
    return { modifiedCount: count };
  }

  async remove(id: string) {
    const index = this.globalNotifications.findIndex((n) => n.id === id);
    if (index === -1) throw new NotFoundException(`Notification #${id} not found.`);
    this.globalNotifications.splice(index, 1);
    return { message: `Notification #${id} deleted successfully.` };
  }
}
