import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantMonitoringService } from './tenant-monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin - Tenant Monitoring')
@Controller('admin/monitoring/stores')
export class TenantMonitoringController {
  constructor(private readonly monitoringService: TenantMonitoringService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:monitoring')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time monitoring stats and Health Scores (0-100) for all stores' })
  getMonitoredStores(@Query() query: any) {
    return this.monitoringService.getMonitoredStores(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:monitoring')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed monitoring stats & Health Score for a single store' })
  getMonitoredStoreById(@Param('id') id: string) {
    return this.monitoringService.getMonitoredStoreById(id);
  }
}
