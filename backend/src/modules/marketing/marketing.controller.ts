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
import { MarketingService } from './marketing.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Marketing & Coupons')
@ApiBearerAuth()
@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('coupons')
  @Roles('super_admin', 'admin', 'company_admin', 'manager')
  @ApiOperation({ summary: 'Create a coupon discount code' })
  create(@Body() dto: CreateCouponDto) {
    return this.marketingService.create(dto);
  }

  @Get('coupons/store/:storeId')
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'List coupons for a store' })
  findByStore(@Param('storeId') storeId: string) {
    return this.marketingService.findByStore(storeId);
  }

  @Post('coupons/validate')
  @ApiOperation({ summary: 'Validate a coupon code against order total' })
  validateCoupon(
    @Body('storeId') storeId: string,
    @Body('code') code: string,
    @Body('cartTotal') cartTotal: number,
  ) {
    return this.marketingService.validateCoupon(storeId, code, cartTotal);
  }

  @Patch('coupons/:id')
  @Roles('super_admin', 'admin', 'company_admin', 'manager')
  @ApiOperation({ summary: 'Update coupon details' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.marketingService.update(id, dto);
  }

  @Delete('coupons/:id')
  @Roles('super_admin', 'admin', 'company_admin')
  @ApiOperation({ summary: 'Delete coupon' })
  remove(@Param('id') id: string) {
    return this.marketingService.remove(id);
  }
}
