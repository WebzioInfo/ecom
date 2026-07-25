import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { ProvisionStoreDto } from './dto/provision-store.dto';
import { StoreStatus } from '@prisma/public-client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Create a basic store' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Post('provision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Provision a complete SaaS Tenant Store with credentials & settings' })
  provisionStore(@Body() provisionStoreDto: ProvisionStoreDto) {
    return this.storesService.provisionStore(provisionStoreDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Get all stores with pagination, search, and filters' })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: StoreStatus,
    @Query('planId') planId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.storesService.findAll({
      search,
      status,
      planId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('analytics/global')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Get aggregated SaaS platform metrics' })
  getGlobalAnalytics() {
    return this.storesService.getGlobalAnalytics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store details by ID' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get store details by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  @Get(':id/full-details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Get 10-Tab complete Tenant Management profile' })
  getFullDetails(@Param('id') id: string) {
    return this.storesService.getFullDetails(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Update store metadata' })
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Change store status (ACTIVE, SUSPENDED, PENDING)' })
  setStatus(@Param('id') id: string, @Body('status') status: StoreStatus) {
    return this.storesService.setStatus(id, status);
  }

  @Patch(':id/change-plan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Upgrade or downgrade store subscription plan' })
  changePlan(@Param('id') id: string, @Body('planId') planId: string) {
    return this.storesService.changePlan(id, planId);
  }

  // --- PASSWORD & ADMIN ACCOUNT CONTROLS ---

  @Post(':id/admin/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Reset store admin password and generate temporary pass' })
  resetAdminPassword(@Param('id') id: string) {
    return this.storesService.resetAdminPassword(id);
  }

  @Post(':id/admin/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Change store admin password with explicit new password' })
  changeAdminPassword(@Param('id') id: string, @Body('newPassword') newPassword: string) {
    return this.storesService.changeAdminPassword(id, newPassword);
  }

  @Patch(':id/admin/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Suspend or activate store admin login' })
  setAdminStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.storesService.setAdminStatus(id, isActive);
  }

  // --- CONTROL APIS ---

  @Post(':id/reset-cache')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Flush Redis cache for tenant' })
  resetCache(@Param('id') id: string) {
    return this.storesService.resetCache(id);
  }

  @Post(':id/force-logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Force logout all active user sessions for tenant' })
  forceLogout(@Param('id') id: string) {
    return this.storesService.forceLogout(id);
  }

  @Post(':id/renew-subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Renew tenant subscription for 30 days' })
  renewSubscription(@Param('id') id: string) {
    return this.storesService.renewSubscription(id);
  }

  @Post(':id/generate-invoice')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Generate subscription billing invoice' })
  generateInvoice(@Param('id') id: string) {
    return this.storesService.generateInvoice(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin')
  @ApiOperation({ summary: 'Delete store by ID' })
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
