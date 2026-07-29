import { Module } from '@nestjs/common';
import { TenantMonitoringController } from './tenant-monitoring.controller';
import { TenantMonitoringService } from './tenant-monitoring.service';


@Module({
  controllers: [TenantMonitoringController],
  providers: [TenantMonitoringService],
  exports: [TenantMonitoringService],
})
export class TenantMonitoringModule {}
