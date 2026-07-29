import { Module } from '@nestjs/common';
import { ExportEngineController } from './export-engine.controller';
import { ExportEngineService } from './export-engine.service';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Module({
  controllers: [ExportEngineController],
  providers: [ExportEngineService, CatalogEventService],
  exports: [ExportEngineService],
})
export class ExportEngineModule {}
