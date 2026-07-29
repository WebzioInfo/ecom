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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('Orders - Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new discount coupon' })
  create(@Body() dto: CreateCouponDto, @Req() req: any) {
    return this.couponsService.create(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get all coupons' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get coupon details by ID' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update coupon details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
    @Req() req: any,
  ) {
    return this.couponsService.update(id, dto, req.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete coupon' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.couponsService.remove(id, req.user?.userId);
  }
}
