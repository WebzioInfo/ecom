import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Super Admin - API Keys')
@ApiBearerAuth()
@Controller('admin/stores/:storeId/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:apikeys')
  @ApiOperation({ summary: 'Generate a new API Key pair for store' })
  create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateApiKeyDto,
    @Req() req: any,
  ) {
    return this.apiKeysService.create({ ...dto, storeId }, req.user?.userId);
  }

  @Post('rotate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:apikeys')
  @ApiOperation({ summary: 'Rotate & regenerate API Key pair for store' })
  rotate(@Param('storeId') storeId: string, @Req() req: any) {
    return this.apiKeysService.rotateKeys(storeId, req.user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:apikeys')
  @ApiOperation({ summary: 'Get all API Keys for store' })
  findByStore(@Param('storeId') storeId: string) {
    return this.apiKeysService.findByStore(storeId);
  }

  @Delete(':keyId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:apikeys')
  @ApiOperation({ summary: 'Revoke an API Key' })
  revoke(@Param('keyId') keyId: string, @Req() req: any) {
    return this.apiKeysService.revoke(keyId, req.user?.userId);
  }
}
