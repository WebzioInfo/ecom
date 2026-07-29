import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportEngineService } from './export-engine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Reports - Export Engine')
@Controller('reports/export')
export class ExportEngineController {
  constructor(private readonly exportService: ExportEngineService) {}

  @Post('csv')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('reports:export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export report dataset to CSV format' })
  exportCSV(@Body() body: { title?: string; data: any[]; fields?: string[] }) {
    return this.exportService.exportCSV(body);
  }

  @Post('excel')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('reports:export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export report dataset to Excel spreadsheet layout' })
  exportExcel(@Body() body: { title?: string; data: any[]; sheetName?: string }) {
    return this.exportService.exportExcel(body);
  }

  @Post('pdf')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('reports:export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export report summary layout to PDF format' })
  exportPDF(@Body() body: { title?: string; summary?: any; data: any[] }) {
    return this.exportService.exportPDF(body);
  }
}
