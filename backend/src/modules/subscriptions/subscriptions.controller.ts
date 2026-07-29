import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin - Subscriptions')
@Controller('admin')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new SaaS subscription for store' })
  create(@Body() dto: CreateSubscriptionDto, @Req() req: any) {
    return this.subscriptionsService.create(dto, req.user?.userId);
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all store subscriptions' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('subscriptions/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription details for store' })
  findOne(@Param('storeId') storeId: string) {
    return this.subscriptionsService.findOne(storeId);
  }

  @Post('subscriptions/:storeId/activate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate subscription' })
  activate(@Param('storeId') storeId: string, @Req() req: any) {
    return this.subscriptionsService.updateState(storeId, 'ACTIVE', req.user?.userId);
  }

  @Post('subscriptions/:storeId/renew')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renew subscription for next billing cycle' })
  renew(
    @Param('storeId') storeId: string,
    @Body() dto: RenewSubscriptionDto,
    @Req() req: any,
  ) {
    return this.subscriptionsService.renew(storeId, dto, req.user?.userId);
  }

  @Post('subscriptions/:storeId/upgrade')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upgrade store plan immediately' })
  upgrade(
    @Param('storeId') storeId: string,
    @Body() dto: UpgradeSubscriptionDto,
    @Req() req: any,
  ) {
    return this.subscriptionsService.upgrade(storeId, dto, req.user?.userId);
  }

  @Post('subscriptions/:storeId/downgrade')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule plan downgrade for end of current cycle' })
  downgrade(
    @Param('storeId') storeId: string,
    @Body() dto: UpgradeSubscriptionDto,
    @Req() req: any,
  ) {
    return this.subscriptionsService.downgrade(storeId, dto, req.user?.userId);
  }

  @Post('subscriptions/:storeId/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend subscription' })
  suspend(@Param('storeId') storeId: string, @Req() req: any) {
    return this.subscriptionsService.updateState(storeId, 'SUSPENDED', req.user?.userId);
  }

  @Post('subscriptions/:storeId/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivate suspended subscription' })
  reactivate(@Param('storeId') storeId: string, @Req() req: any) {
    return this.subscriptionsService.updateState(storeId, 'ACTIVE', req.user?.userId);
  }

  @Post('subscriptions/:storeId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@Param('storeId') storeId: string, @Req() req: any) {
    return this.subscriptionsService.updateState(storeId, 'CANCELLED', req.user?.userId);
  }

  @Get('subscriptions/:storeId/usage')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:usage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time usage tracking & remaining quota for subscription' })
  getSubscriptionUsage(@Param('storeId') storeId: string) {
    return this.subscriptionsService.getUsage(storeId);
  }

  @Get('stores/:storeId/usage')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:usage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time usage tracking & remaining quota for store' })
  getStoreUsage(@Param('storeId') storeId: string) {
    return this.subscriptionsService.getUsage(storeId);
  }
}
