import { Global, Module } from '@nestjs/common';
import { CatalogEventService } from './catalog-event.service';

@Global()
@Module({
  providers: [CatalogEventService],
  exports: [CatalogEventService],
})
export class CatalogEventModule {}
