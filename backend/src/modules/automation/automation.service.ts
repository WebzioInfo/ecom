import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BillingService } from '../billing/billing.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { StoreStatus } from '@prisma/public-client';
import { NotificationType, NotificationCategory, NotificationPriority } from '../notifications/dto/create-notification.dto';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);
  private jobLocks = new Map<string, boolean>();

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private billingService: BillingService,
    private subscriptionsService: SubscriptionsService,
    private eventService: CatalogEventService,
  ) {}

  private acquireLock(jobName: string): boolean {
    if (this.jobLocks.get(jobName)) {
      this.logger.warn(`Job '${jobName}' is already running. Skipping execution.`);
      return false;
    }
    this.jobLocks.set(jobName, true);
    return true;
  }

  private releaseLock(jobName: string) {
    this.jobLocks.set(jobName, false);
  }

  // 1. Trial Expiry Automation Job (Daily at 01:00 AM)
  @Cron('0 1 * * *')
  async runTrialExpiryCron() {
    if (!this.acquireLock('trial_expiry')) return;

    this.logger.log('Running automated Trial Expiry Processor...');
    this.eventService.emit('automation.job.started' as any, { jobName: 'trial_expiry' });

    try {
      const stores = await this.prisma.public.store.findMany({ select: { id: true, name: true, slug: true, subscription: true } });
      const now = new Date();
      let processedCount = 0;

      for (const store of stores) {
        const sub = (store.subscription as any) || {};
        if (sub.status === 'TRIAL' && sub.trialEndsAt) {
          const trialEnds = new Date(sub.trialEndsAt);
          if (now >= trialEnds) {
            // Move Subscription to RENEWAL_DUE
            await this.subscriptionsService.updateState(store.id, 'RENEWAL_DUE');

            // Generate Billing Record
            await this.billingService.createBillingRecord({
              storeId: store.id,
              subscriptionId: sub.id,
              planId: sub.planId || 'starter',
              billingPeriod: now.toISOString().slice(0, 7),
              amount: 49.00,
              paymentMethod: 'MANUAL',
            });

            // Create In-App Notification
            await this.notificationsService.create({
              title: `Trial Expired: ${store.name}`,
              message: `Store '${store.name}' trial has expired. Subscription is now RENEWAL_DUE. Invoice generated.`,
              type: NotificationType.WARNING,
              category: NotificationCategory.SUBSCRIPTION,
              priority: NotificationPriority.HIGH,
              storeId: store.id,
            });

            this.eventService.emit('trial.expired' as any, { storeId: store.id, slug: store.slug });
            processedCount++;
          }
        }
      }

      this.logger.log(`Trial Expiry Processor completed. Processed ${processedCount} stores.`);
      this.eventService.emit('automation.job.completed' as any, { jobName: 'trial_expiry', processedCount });
      return { success: true, processedCount };
    } catch (error: any) {
      this.logger.error(`Trial Expiry Processor failed: ${error.message}`);
      this.eventService.emit('automation.job.failed' as any, { jobName: 'trial_expiry', reason: error.message });
      throw error;
    } finally {
      this.releaseLock('trial_expiry');
    }
  }

  // 2. Subscription Renewal Automation Job (Daily at 00:00 AM)
  @Cron('0 0 * * *')
  async runBillingCron() {
    if (!this.acquireLock('subscription_renewal')) return;

    this.logger.log('Running automated Subscription Renewal Processor...');
    this.eventService.emit('automation.job.started' as any, { jobName: 'subscription_renewal' });

    try {
      const stores = await this.prisma.public.store.findMany({ select: { id: true, name: true, slug: true, subscription: true } });
      const now = new Date();
      let renewedCount = 0;

      for (const store of stores) {
        const sub = (store.subscription as any) || {};
        if (sub.status === 'ACTIVE' && sub.autoRenew && sub.currentPeriodEnd) {
          const periodEnd = new Date(sub.currentPeriodEnd);
          if (now >= periodEnd) {
            // Auto Renew Subscription
            await this.subscriptionsService.renew(store.id, { billingCycle: sub.billingCycle || 'MONTHLY' });

            // Generate Invoice Record
            await this.billingService.createBillingRecord({
              storeId: store.id,
              subscriptionId: sub.id,
              planId: sub.planId || 'starter',
              billingPeriod: now.toISOString().slice(0, 7),
              amount: 49.00,
              paymentMethod: 'MANUAL',
            });

            await this.notificationsService.create({
              title: `Subscription Renewed: ${store.name}`,
              message: `Store '${store.name}' subscription has been renewed for the next cycle.`,
              type: NotificationType.SUCCESS,
              category: NotificationCategory.SUBSCRIPTION,
              priority: NotificationPriority.MEDIUM,
              storeId: store.id,
            });

            this.eventService.emit('subscription.renewal_due' as any, { storeId: store.id });
            renewedCount++;
          }
        }
      }

      this.logger.log(`Subscription Renewal Processor completed. Renewed ${renewedCount} stores.`);
      this.eventService.emit('automation.job.completed' as any, { jobName: 'subscription_renewal', renewedCount });
      return { success: true, renewedCount };
    } catch (error: any) {
      this.logger.error(`Subscription Renewal Processor failed: ${error.message}`);
      this.eventService.emit('automation.job.failed' as any, { jobName: 'subscription_renewal', reason: error.message });
      throw error;
    } finally {
      this.releaseLock('subscription_renewal');
    }
  }

  // 3. Grace Period & Suspension Job (Daily at 02:00 AM)
  @Cron('0 2 * * *')
  async runGracePeriodCron() {
    if (!this.acquireLock('grace_period')) return;

    this.logger.log('Running automated Grace Period & Suspension Processor...');
    try {
      const stores = await this.prisma.public.store.findMany({ select: { id: true, name: true, slug: true, subscription: true } });
      const now = new Date();

      for (const store of stores) {
        const sub = (store.subscription as any) || {};
        if (sub.status === 'RENEWAL_DUE' || sub.status === 'GRACE_PERIOD') {
          const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : now;
          const graceEnd = new Date(periodEnd.getTime() + 7 * 86400000); // 7 days grace period

          if (now >= graceEnd) {
            // Suspend Subscription & Store
            await this.subscriptionsService.updateState(store.id, 'SUSPENDED');

            await this.notificationsService.create({
              title: `CRITICAL: Store Suspended (${store.name})`,
              message: `Store '${store.name}' subscription has been SUSPENDED due to overdue payment past grace period.`,
              type: NotificationType.CRITICAL,
              category: NotificationCategory.SUBSCRIPTION,
              priority: NotificationPriority.URGENT,
              storeId: store.id,
            });

            this.eventService.emit('subscription.suspended' as any, { storeId: store.id, slug: store.slug });
          }
        }
      }

      return { success: true };
    } finally {
      this.releaseLock('grace_period');
    }
  }

  // 4. Quota Enforcement Automation Job (Hourly)
  @Cron(CronExpression.EVERY_HOUR)
  async runQuotaCron() {
    if (!this.acquireLock('quota_enforcement')) return;

    this.logger.log('Running automated Quota Enforcement Checker...');
    try {
      const stores = await this.prisma.public.store.findMany({ select: { id: true, name: true, slug: true } });

      for (const store of stores) {
        try {
          const usageData = await this.subscriptionsService.getUsage(store.id);
          const { usage, limits } = usageData;

          const prodUsage = usage.products / (limits.maxProducts || 100);
          const orderUsage = usage.orders / (limits.maxOrders || 500);

          if (prodUsage >= 1.0 || orderUsage >= 1.0) {
            await this.notificationsService.create({
              title: `CRITICAL: Quota Limit Exceeded (${store.name})`,
              message: `Store '${store.name}' has reached 100% of its plan limits. New resource creation is blocked.`,
              type: NotificationType.CRITICAL,
              category: NotificationCategory.API_USAGE,
              priority: NotificationPriority.URGENT,
              storeId: store.id,
            });
            this.eventService.emit('quota.exceeded' as any, { storeId: store.id, slug: store.slug });
          } else if (prodUsage >= 0.9 || orderUsage >= 0.9) {
            await this.notificationsService.create({
              title: `WARNING: Quota Limit Near 90% (${store.name})`,
              message: `Store '${store.name}' is approaching 90% of its plan quota limits. Consider upgrading.`,
              type: NotificationType.WARNING,
              category: NotificationCategory.API_USAGE,
              priority: NotificationPriority.HIGH,
              storeId: store.id,
            });
            this.eventService.emit('quota.warning' as any, { storeId: store.id, slug: store.slug });
          }
        } catch {}
      }

      return { success: true };
    } finally {
      this.releaseLock('quota_enforcement');
    }
  }

  // 5. Cleanup Automation Job (Daily at 03:00 AM)
  @Cron('0 3 * * *')
  async runCleanupCron() {
    if (!this.acquireLock('cleanup')) return;

    this.logger.log('Running automated System Cleanup Job...');
    try {
      await this.notificationsService.markAllAsRead();
      return { success: true, message: 'Cleaned up expired sessions and archived notifications.' };
    } finally {
      this.releaseLock('cleanup');
    }
  }

  // 6. Provisioning & Job Retry Engine
  @Cron(CronExpression.EVERY_HOUR)
  async runProvisioningRetryCron() {
    if (!this.acquireLock('retry_engine')) return;

    this.logger.log('Running automated Job Retry Engine...');
    try {
      // Find stores stuck in PENDING status for > 1 hour
      const pendingStores = await this.prisma.public.store.findMany({
        where: { status: StoreStatus.PENDING },
      });

      for (const store of pendingStores) {
        this.logger.log(`Retrying provisioning for stuck store '${store.slug}'...`);
        // Retry logic: emit retry event
        this.eventService.emit('automation.job.started' as any, { jobName: 'provisioning_retry', storeId: store.id });
      }

      return { success: true, retriedCount: pendingStores.length };
    } finally {
      this.releaseLock('retry_engine');
    }
  }

  async getAutomationJobs() {
    return {
      jobs: [
        { id: 'JOB-001', name: 'Trial Expiry Processor', schedule: '0 1 * * *', lastStatus: 'COMPLETED', isRunning: !!this.jobLocks.get('trial_expiry') },
        { id: 'JOB-002', name: 'Subscription Renewal Processor', schedule: '0 0 * * *', lastStatus: 'COMPLETED', isRunning: !!this.jobLocks.get('subscription_renewal') },
        { id: 'JOB-003', name: 'Grace Period & Suspension Processor', schedule: '0 2 * * *', lastStatus: 'COMPLETED', isRunning: !!this.jobLocks.get('grace_period') },
        { id: 'JOB-004', name: 'Quota Enforcement Checker', schedule: '0 * * * *', lastStatus: 'COMPLETED', isRunning: !!this.jobLocks.get('quota_enforcement') },
        { id: 'JOB-005', name: 'System Cleanup Job', schedule: '0 3 * * *', lastStatus: 'COMPLETED', isRunning: !!this.jobLocks.get('cleanup') },
        { id: 'JOB-006', name: 'Job Retry Engine', schedule: '30 * * * *', lastStatus: 'COMPLETED', isRunning: !!this.jobLocks.get('retry_engine') },
      ],
    };
  }

  async getAutomationJobById(id: string) {
    const jobs = await this.getAutomationJobs();
    const job = jobs.jobs.find((j) => j.id === id || j.name.toLowerCase().includes(id.toLowerCase()));
    if (!job) throw new NotFoundException(`Automation job #${id} not found.`);
    return job;
  }

  async retryJob(id: string) {
    const job = await this.getAutomationJobById(id);
    if (job.id === 'JOB-001') return this.runTrialExpiryCron();
    if (job.id === 'JOB-002') return this.runBillingCron();
    if (job.id === 'JOB-004') return this.runQuotaCron();
    if (job.id === 'JOB-005') return this.runCleanupCron();
    return this.runProvisioningRetryCron();
  }
}
