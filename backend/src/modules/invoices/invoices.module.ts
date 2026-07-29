import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, CatalogEventService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
