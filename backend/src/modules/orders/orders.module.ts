import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CheckoutController } from './checkout/checkout.controller';
import { CheckoutService } from './checkout/checkout.service';
import { CouponsController } from './coupons/coupons.controller';
import { CouponsService } from './coupons/coupons.service';
import { CartModule } from '../cart/cart.module';
import { InventoryModule } from '../inventory/inventory.module';


@Module({
  imports: [CartModule, InventoryModule],
  controllers: [
    OrdersController,
    CheckoutController,
    CouponsController,
  ],
  providers: [
    OrdersService,
    CheckoutService,
    CouponsService,
  ],
  exports: [
    OrdersService,
    CheckoutService,
    CouponsService,
  ],
})
export class OrdersModule {}
