import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, CatalogEventService],
  exports: [CustomersService],
})
export class CustomersModule {}
