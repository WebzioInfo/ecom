import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CashOnDeliveryStrategy } from './strategies/cod.strategy';
import { ManualPaymentStrategy } from './strategies/manual-payment.strategy';


@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    CashOnDeliveryStrategy,
    ManualPaymentStrategy,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
