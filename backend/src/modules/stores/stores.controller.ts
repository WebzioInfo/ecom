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
import { StoreStatus } from './schemas/store.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a new client store (Tenant)' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @Roles('super_admin', 'admin', 'support')
  @ApiOperation({ summary: 'List all stores with search & pagination' })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.storesService.findAll({
      search,
      status,
      page: +page,
      limit: +limit,
    });
  }

  @Get('analytics/global')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get Super Admin global multi-tenant metrics' })
  getGlobalAnalytics() {
    return this.storesService.getGlobalAnalytics();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get store details by unique slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store details by ID' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Get(':id/full-details')
  @Roles('super_admin')
  @ApiOperation({
    summary: 'Get complete store details including plans and metrics',
  })
  getFullDetails(@Param('id') id: string) {
    return this.storesService.getFullDetails(id);
  }

  @Patch(':id/plan')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Change the subscription plan of a store' })
  changePlan(@Param('id') id: string, @Body('planId') planId: string) {
    return this.storesService.changePlan(id, planId);
  }

  @Patch(':id/transfer-ownership')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Transfer ownership of a store to a new user' })
  transferOwnership(
    @Param('id') id: string,
    @Body('newOwnerId') newOwnerId: string,
  ) {
    return this.storesService.transferOwnership(id, newOwnerId);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'company_admin')
  @ApiOperation({
    summary: 'Update store configuration, branding, or settings',
  })
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Patch(':id/suspend')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Suspend a store' })
  suspend(@Param('id') id: string) {
    return this.storesService.setStatus(id, StoreStatus.SUSPENDED);
  }

  @Patch(':id/activate')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Activate a suspended store' })
  activate(@Param('id') id: string) {
    return this.storesService.setStatus(id, StoreStatus.ACTIVE);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete a store permanently' })
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
