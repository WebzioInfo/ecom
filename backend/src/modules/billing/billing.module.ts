import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Module({
  imports: [SubscriptionsModule],
  controllers: [BillingController],
  providers: [BillingService, CatalogEventService],
  exports: [BillingService],
})
export class BillingModule {}
