import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  async getSummary() {
    return this.reportsService.getSummaryReport();
  }

  @Get('export')
  async exportCsv(@Query('type') type: string, @Res() res: any) {
    const csv = await this.reportsService.exportCsvReport(type || 'orders');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type || 'report'}.csv`);
    return res.send(csv);
  }
}
