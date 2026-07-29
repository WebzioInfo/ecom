import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillingModule } from '../billing/billing.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Module({
  imports: [NotificationsModule, BillingModule, SubscriptionsModule],
  controllers: [AutomationController],
  providers: [AutomationService, CatalogEventService],
  exports: [AutomationService],
})
export class AutomationModule {}
