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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('Inventory - Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('suppliers:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new supplier profile' })
  create(@Body() dto: CreateSupplierDto, @Req() req: any) {
    return this.suppliersService.create(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get all suppliers' })
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get supplier details by ID' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('suppliers:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update supplier details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @Req() req: any,
  ) {
    return this.suppliersService.update(id, dto, req.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('suppliers:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a supplier' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.suppliersService.remove(id, req.user?.userId);
  }
}
