import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportsPdfService } from './reports-pdf.service';
import { ReportsQueryDto } from './dto/reports-query.dto';
import { FullReportQueryDto } from './dto/full-report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly reportsPdfService: ReportsPdfService,
  ) {}

  @Get('dashboard')
  getDashboard(@Query() query: ReportsQueryDto) {
    return this.reportsService.getDashboard(query.companyId, query);
  }

  @Get('expense-breakdown')
  getExpenseBreakdown(@Query() query: ReportsQueryDto) {
    return this.reportsService.getExpenseBreakdown(query.companyId, query);
  }

  @Get('cpk-trend')
  getCpkTrend(@Query() query: ReportsQueryDto) {
    return this.reportsService.getCpkTrend(query.companyId, query);
  }

  @Get('asset-utilization')
  getAssetUtilization(@Query() query: ReportsQueryDto) {
    return this.reportsService.getAssetUtilization(query.companyId, query);
  }

  @Get('vehicle-comparison')
  getVehicleComparison(@Query() query: ReportsQueryDto) {
    return this.reportsService.getVehicleComparison(query.companyId, query);
  }

  @Get('full-report/pdf')
  async getFullReportPdf(@Query() query: FullReportQueryDto, @Res() res: Response) {
    const asOfDate = query.date ?? new Date().toISOString().slice(0, 10);
    const data = await this.reportsService.getFullReportData(query.companyId, asOfDate);
    const doc = this.reportsPdfService.generate(data);
    const safeCompanyName = (data.company?.name ?? 'company').replace(/[^a-z0-9]+/gi, '_');
    const fileName = `fleet-report-${safeCompanyName}-${asOfDate}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    doc.pipe(res);
    doc.end();
  }
}
