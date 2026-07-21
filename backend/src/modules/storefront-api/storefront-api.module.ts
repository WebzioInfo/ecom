import { Module } from '@nestjs/common';
import { StorefrontApiService } from './storefront-api.service';
import { StorefrontApiController } from './storefront-api.controller';
import { StoresModule } from '../stores/stores.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    StoresModule,
    ProductsModule,
    OrdersModule,
    ApiKeysModule,
  ],
  controllers: [StorefrontApiController],
  providers: [StorefrontApiService],
})
export class StorefrontApiModule {}
