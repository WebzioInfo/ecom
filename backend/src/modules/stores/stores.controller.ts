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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { ProvisionStoreDto } from './dto/provision-store.dto';
import { UpdateStoreBrandingDto } from './dto/store-branding.dto';
import { UpdateStoreSettingsDto } from './dto/store-settings.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { StoreStatus } from '@prisma/public-client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin - Stores & Tenant Provisioning')
@Controller('admin/stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register draft store' })
  create(@Body() dto: CreateStoreDto, @Req() req: any) {
    return this.storesService.create(dto, req.user?.userId);
  }

  @Post('provision')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:provision')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger atomic 11-step store provisioning engine' })
  provisionStoreDirect(@Body() dto: ProvisionStoreDto, @Req() req: any) {
    return this.storesService.provisionStore(dto, req.user?.userId);
  }

  @Post(':id/provision')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:provision')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger store provisioning for existing draft' })
  provisionStore(@Body() dto: ProvisionStoreDto, @Req() req: any) {
    return this.storesService.provisionStore(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tenant stores with pagination & search' })
  findAll(@Query() query: any) {
    return this.storesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store details by ID' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @Req() req: any,
  ) {
    return this.storesService.update(id, dto, req.user?.userId);
  }

  @Post(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend active store' })
  suspendStore(@Param('id') id: string, @Req() req: any) {
    return this.storesService.updateState(id, StoreStatus.SUSPENDED, req.user?.userId);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate suspended / draft store' })
  activateStore(@Param('id') id: string, @Req() req: any) {
    return this.storesService.updateState(id, StoreStatus.ACTIVE, req.user?.userId);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive store' })
  archiveStore(@Param('id') id: string, @Req() req: any) {
    return this.storesService.updateState(id, StoreStatus.SUSPENDED, req.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete store' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.storesService.remove(id, req.user?.userId);
  }

  @Patch(':id/branding')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store branding assets & theme colors' })
  updateBranding(
    @Param('id') id: string,
    @Body() dto: UpdateStoreBrandingDto,
    @Req() req: any,
  ) {
    return this.storesService.updateBranding(id, dto, req.user?.userId);
  }

  @Patch(':id/settings')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store general settings & tax config' })
  updateSettings(
    @Param('id') id: string,
    @Body() dto: UpdateStoreSettingsDto,
    @Req() req: any,
  ) {
    return this.storesService.updateSettings(id, dto, req.user?.userId);
  }

  @Post(':id/domain')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:domains')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register custom domain for store' })
  addDomain(
    @Param('id') storeId: string,
    @Body() dto: CreateDomainDto,
    @Req() req: any,
  ) {
    return this.storesService.addDomain(storeId, dto, req.user?.userId);
  }

  @Patch('domain/:domainId/verify')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:domains')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify domain DNS status' })
  verifyDomain(@Param('domainId') domainId: string, @Req() req: any) {
    return this.storesService.verifyDomain(domainId, req.user?.userId);
  }

  @Get(':id/full-details')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store full operational details' })
  getFullDetails(@Param('id') id: string) {
    return this.storesService.getFullDetails(id);
  }

  @Get(':id/team')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store team members' })
  getTeamMembers(@Param('id') id: string) {
    return this.storesService.getTeamMembers(id);
  }

  @Post(':id/team/invite')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a team member to store' })
  inviteTeamMember(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.storesService.inviteTeamMember(id, dto, req.user?.userId);
  }

  @Patch(':id/team/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store team member role or status' })
  updateTeamMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: any,
  ) {
    return this.storesService.updateTeamMember(id, userId, dto);
  }

  @Delete(':id/team/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a store team member' })
  deleteTeamMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.storesService.deleteTeamMember(id, userId);
  }

  @Get(':id/activity')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:stores')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store activity audit timeline' })
  getActivityTimeline(@Param('id') id: string) {
    return this.storesService.getActivityTimeline(id);
  }
}
