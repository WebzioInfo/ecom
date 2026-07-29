import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Module({
  controllers: [CartController],
  providers: [CartService, CatalogEventService],
  exports: [CartService],
})
export class CartModule {}
