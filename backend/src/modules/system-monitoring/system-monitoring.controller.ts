import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemMonitoringService } from './system-monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin - System Health & Operations Monitoring')
@Controller('admin')
export class SystemMonitoringController {
  constructor(private readonly monitoringService: SystemMonitoringService) {}

  @Get('system/health')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get overall platform system health, DB status, memory & CPU usage' })
  getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('system/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get concise platform system status' })
  getSystemStatus() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('provisioning/jobs')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all store provisioning job trajectories' })
  getProvisioningJobs() {
    return this.monitoringService.getProvisioningJobs();
  }

  @Get('provisioning/jobs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get provisioning job status by ID' })
  getProvisioningJobById(@Param('id') id: string) {
    return this.monitoringService.getProvisioningJobById(id);
  }

  @Get('jobs')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get background cron jobs status' })
  getBackgroundJobs() {
    return this.monitoringService.getBackgroundJobs();
  }

  @Get('jobs/failed')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get failed background jobs queue' })
  getFailedJobs() {
    return this.monitoringService.getFailedJobs();
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform operational notifications & warnings' })
  getNotifications() {
    return this.monitoringService.getNotifications();
  }

  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark platform notification as read' })
  markNotificationRead(@Param('id') id: string) {
    return this.monitoringService.markNotificationRead(id);
  }

  @Get('audit')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:audit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform administrative audit log timeline' })
  getAuditLogs(@Query() query: any) {
    return this.monitoringService.getAuditLogs(query);
  }

  @Get('audit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:audit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get audit log record by ID' })
  getAuditLogById(@Param('id') id: string) {
    return this.monitoringService.getAuditLogById(id);
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get aggregated platform API request usage statistics' })
  getUsageStats() {
    return this.monitoringService.getUsageStats();
  }

  @Get('storage')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get aggregated platform storage usage statistics' })
  getStorageStats() {
    return this.monitoringService.getStorageStats();
  }
}
