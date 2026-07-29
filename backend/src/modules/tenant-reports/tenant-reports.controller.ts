import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantReportsService } from './tenant-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Reports & Analytics (Tenant)')
@Controller()
export class TenantReportsController {
  constructor(private readonly reportsService: TenantReportsService) {}

  @Get('reports/sales')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Sales Analytics (Gross, Net, AOV, Best Sellers)' })
  getSalesReport(@Query() query: any) {
    return this.reportsService.getSalesReport(query);
  }

  @Get('reports/orders')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Orders Status & Fulfillment Report' })
  getOrdersReport(@Query() query: any) {
    return this.reportsService.getOrdersReport(query);
  }

  @Get('reports/customers')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Customer Spender & Retention Report' })
  getCustomersReport(@Query() query: any) {
    return this.reportsService.getCustomersReport(query);
  }

  @Get('reports/products')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Product Catalog & Status Report' })
  getProductsReport(@Query() query: any) {
    return this.reportsService.getProductsReport(query);
  }

  @Get('reports/inventory')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Inventory Stock & Valuation Report' })
  getInventoryReport(@Query() query: any) {
    return this.reportsService.getInventoryReport(query);
  }

  @Get('reports/payments')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Financial Payments Report' })
  getPaymentsReport(@Query() query: any) {
    return this.reportsService.getPaymentsReport(query);
  }

  @Get('reports/invoices')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Invoices Status Report' })
  getInvoicesReport(@Query() query: any) {
    return this.reportsService.getInvoicesReport(query);
  }

  @Get('reports/shipments')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Shipments Logistics Report' })
  getShipmentsReport(@Query() query: any) {
    return this.reportsService.getShipmentsReport(query);
  }

  @Get('analytics/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Chart-Ready JSON Datasets (Line, Bar, Donut charts)' })
  getAnalyticsDashboard(@Query() query: any) {
    return this.reportsService.getAnalyticsDashboard(query);
  }

  @Get('analytics/kpi')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Store Key Performance Indicators (KPIs)' })
  getAnalyticsKPI(@Query() query: any) {
    return this.reportsService.getAnalyticsKPI(query);
  }

  @Get('analytics/trends')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('reports.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Growth & Sales Trend Analysis' })
  getAnalyticsTrends(@Query() query: any) {
    return this.reportsService.getAnalyticsTrends(query);
  }
}
