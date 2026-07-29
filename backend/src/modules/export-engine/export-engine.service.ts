import { Injectable, Logger } from '@nestjs/common';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Injectable()
export class ExportEngineService {
  private readonly logger = new Logger(ExportEngineService.name);

  constructor(private eventService: CatalogEventService) {}

  async exportCSV(body: { title?: string; data: any[]; fields?: string[] }) {
    const data = body.data || [];
    if (data.length === 0) return { contentType: 'text/csv', content: 'No data available' };

    const keys = body.fields || Object.keys(data[0]);
    const header = keys.join(',');

    const rows = data.map((row) =>
      keys
        .map((k) => {
          const val = row[k] ?? '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(','),
    );

    const csvContent = [header, ...rows].join('\n');

    this.eventService.emit('report.exported' as any, { format: 'CSV', title: body.title });

    return {
      contentType: 'text/csv',
      filename: `${(body.title || 'report').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`,
      content: csvContent,
    };
  }

  async exportExcel(body: { title?: string; data: any[]; sheetName?: string }) {
    const data = body.data || [];

    this.eventService.emit('report.exported' as any, { format: 'EXCEL', title: body.title });

    return {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `${(body.title || 'report').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.xlsx`,
      sheetName: body.sheetName || 'Report Data',
      totalRows: data.length,
      rows: data,
    };
  }

  async exportPDF(body: { title?: string; summary?: any; data: any[] }) {
    this.eventService.emit('report.exported' as any, { format: 'PDF', title: body.title });

    return {
      contentType: 'application/pdf',
      filename: `${(body.title || 'report').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      documentTitle: body.title || 'Business Report Summary',
      generatedAt: new Date().toISOString(),
      summary: body.summary || {},
      data: body.data || [],
    };
  }
}
