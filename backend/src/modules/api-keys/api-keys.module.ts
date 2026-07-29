import { Module } from '@nestjs/common';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Module({
  controllers: [ApiKeysController],
  providers: [ApiKeysService, CatalogEventService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
