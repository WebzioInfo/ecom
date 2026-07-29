import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillingRecordDto } from './dto/create-billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Super Admin - Platform Billing')
@Controller('admin/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:billing')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate manual platform billing invoice record' })
  createBillingRecord(@Body() dto: CreateBillingRecordDto, @Req() req: any) {
    return this.billingService.createBillingRecord(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:billing')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all platform billing invoice records' })
  findAll() {
    return this.billingService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:billing')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform billing invoice details by ID / Invoice Number' })
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Patch(':id/pay')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:billing')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark billing invoice as PAID & activate subscription' })
  payBillingRecord(
    @Param('id') id: string,
    @Body('referenceNumber') referenceNumber?: string,
    @Req() req?: any,
  ) {
    return this.billingService.payBillingRecord(id, referenceNumber, req?.user?.userId);
  }

  @Patch(':id/fail')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN')
  @Permissions('superadmin:billing')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark billing invoice as FAILED & transition subscription to GRACE_PERIOD' })
  failBillingRecord(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @Req() req?: any,
  ) {
    return this.billingService.failBillingRecord(id, reason, req?.user?.userId);
  }
}
