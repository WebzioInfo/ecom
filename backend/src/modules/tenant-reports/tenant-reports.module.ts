import { Module } from '@nestjs/common';
import { TenantReportsController } from './tenant-reports.controller';
import { TenantReportsService } from './tenant-reports.service';


@Module({
  controllers: [TenantReportsController],
  providers: [TenantReportsService],
  exports: [TenantReportsService],
})
export class TenantReportsModule {}
