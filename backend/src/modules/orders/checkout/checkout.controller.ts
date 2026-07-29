import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { TenantGuard } from '../../../common/guards/tenant.guard';

@ApiTags('Orders - Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UseGuards(TenantGuard)
  @ApiOperation({
    summary: 'Process atomic order checkout (Validates cart, stock, coupon, tax, reserves inventory & snapshots items)',
  })
  processCheckout(@Body() dto: CheckoutDto, @Req() req: any) {
    return this.checkoutService.processCheckout(dto, req.user?.userId);
  }
}
