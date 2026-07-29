import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin - Automation Engine')
@Controller('admin/automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get('jobs')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:automation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all scheduled and executed automation jobs' })
  getAutomationJobs() {
    return this.automationService.getAutomationJobs();
  }

  @Get('jobs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:automation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details for a specific automation job' })
  getAutomationJobById(@Param('id') id: string) {
    return this.automationService.getAutomationJobById(id);
  }

  @Post('jobs/:id/retry')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:jobs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually retry a failed automation job' })
  retryJob(@Param('id') id: string) {
    return this.automationService.retryJob(id);
  }

  @Post('run/trials')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:automation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger Trial Expiry Processor' })
  runTrialExpiryCron() {
    return this.automationService.runTrialExpiryCron();
  }

  @Post('run/billing')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:automation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger Subscription Renewal & Billing Generator Processor' })
  runBillingCron() {
    return this.automationService.runBillingCron();
  }

  @Post('run/usage')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:automation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger Quota Enforcement Checker' })
  runQuotaCron() {
    return this.automationService.runQuotaCron();
  }

  @Post('run/cleanup')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:automation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger System Cleanup Job' })
  runCleanupCron() {
    return this.automationService.runCleanupCron();
  }

  @Post('run/provisioning')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:automation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger Provisioning Retry Engine' })
  runProvisioningRetryCron() {
    return this.automationService.runProvisioningRetryCron();
  }
}
