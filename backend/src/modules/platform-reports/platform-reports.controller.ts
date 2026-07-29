import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformReportsService } from './platform-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin - Platform Reports')
@Controller('admin/reports')
export class PlatformReportsController {
  constructor(private readonly reportsService: PlatformReportsService) {}

  @Get('platform')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:reports')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SaaS Platform overall reports (MRR, ARR, ARPU, Store growth)' })
  getPlatformOverview() {
    return this.reportsService.getPlatformOverview();
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:reports')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SaaS Platform revenue reports' })
  getRevenueReport() {
    return this.reportsService.getRevenueReport();
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:reports')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SaaS Subscription analytics report' })
  getSubscriptionReport() {
    return this.reportsService.getSubscriptionReport();
  }

  @Get('stores')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:reports')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Store growth and distribution report' })
  getStoresReport() {
    return this.reportsService.getStoresReport();
  }

  @Get('api-usage')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Platform API usage report' })
  getApiUsageReport() {
    return this.reportsService.getApiUsageReport();
  }

  @Get('storage')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Platform Storage usage report' })
  getStorageReport() {
    return this.reportsService.getStorageReport();
  }
}
