import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Developer API Keys')
@ApiBearerAuth()
@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @Roles('super_admin', 'admin', 'company_admin', 'developer')
  @ApiOperation({ summary: 'Generate a new Store API Key & Webhook secret' })
  create(@Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(dto);
  }

  @Get('store/:storeId')
  @Roles('super_admin', 'admin', 'company_admin', 'developer')
  @ApiOperation({ summary: 'Get all API keys for a specific store' })
  findByStore(@Param('storeId') storeId: string) {
    return this.apiKeysService.findByStore(storeId);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'company_admin', 'developer')
  @ApiOperation({ summary: 'Update API Key settings or permissions' })
  update(@Param('id') id: string, @Body() dto: UpdateApiKeyDto) {
    return this.apiKeysService.update(id, dto);
  }

  @Post(':id/regenerate-secret')
  @Roles('super_admin', 'admin', 'company_admin')
  @ApiOperation({ summary: 'Regenerate API Key secret' })
  regenerateSecret(@Param('id') id: string) {
    return this.apiKeysService.regenerateSecret(id);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin', 'company_admin')
  @ApiOperation({ summary: 'Revoke an API Key' })
  revoke(@Param('id') id: string) {
    return this.apiKeysService.revoke(id);
  }
}
