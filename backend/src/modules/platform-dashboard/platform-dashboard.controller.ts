import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformDashboardService } from './platform-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin - Platform Dashboard')
@Controller('admin/dashboard')
export class PlatformDashboardController {
  constructor(private readonly dashboardService: PlatformDashboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time platform dashboard overview & metrics' })
  getDashboardOverview() {
    return this.dashboardService.getDashboardOverview();
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time platform operational performance metrics' })
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform revenue analytics' })
  getRevenueAnalytics() {
    return this.dashboardService.getRevenueAnalytics();
  }
}
