import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [StoresController, ReportsController],
  providers: [StoresService, ReportsService],
  exports: [StoresService, ReportsService],
})
export class StoresModule {}
