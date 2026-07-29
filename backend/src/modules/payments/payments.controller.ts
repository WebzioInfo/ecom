import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Orders - Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Create payment record for an order' })
  create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create(dto, req.user?.userId);
  }

  @Post(':id/pay')
  @UseGuards(TenantGuard)
  @ApiOperation({
    summary: 'Process successful payment (Converts stock reservation to deduction, auto-generates Invoice & Shipment)',
  })
  processPaymentSuccess(
    @Param('id') id: string,
    @Body('transactionId') transactionId?: string,
    @Req() req?: any,
  ) {
    return this.paymentsService.processPaymentSuccess(id, transactionId, req?.user?.userId);
  }

  @Post(':id/fail')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Process failed payment (Releases reserved stock)' })
  processPaymentFailure(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @Req() req?: any,
  ) {
    return this.paymentsService.processPaymentFailure(id, reason, req?.user?.userId);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:refund')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund paid payment' })
  refundPayment(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.refundPayment(id, req.user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payments' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
