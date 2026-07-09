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

  // GET /reports/dashboard?companyId=2&startDate=2026-01-01&endDate=2026-06-30
  @Get('dashboard')
  getDashboard(@Query() query: ReportsQueryDto) {
    return this.reportsService.getDashboard(query.companyId, query);
  }

  // GET /reports/expense-breakdown?companyId=2&startDate=...&endDate=...
  @Get('expense-breakdown')
  getExpenseBreakdown(@Query() query: ReportsQueryDto) {
    return this.reportsService.getExpenseBreakdown(query.companyId, query);
  }

  // GET /reports/cpk-trend?companyId=2&startDate=...&endDate=...&granularity=month
  @Get('cpk-trend')
  getCpkTrend(@Query() query: ReportsQueryDto) {
    return this.reportsService.getCpkTrend(query.companyId, query);
  }

  // GET /reports/asset-utilization?companyId=2&startDate=...&endDate=...
  @Get('asset-utilization')
  getAssetUtilization(@Query() query: ReportsQueryDto) {
    return this.reportsService.getAssetUtilization(query.companyId, query);
  }

  // GET /reports/vehicle-comparison?companyId=2&startDate=...&endDate=...
  @Get('vehicle-comparison')
  getVehicleComparison(@Query() query: ReportsQueryDto) {
    return this.reportsService.getVehicleComparison(query.companyId, query);
  }

  // GET /reports/full-report/pdf?companyId=2&date=2026-07-09
  // Generates a full compliance + financial PDF report for the whole fleet,
  // covering everything from the company's earliest records through `date`
  // (defaults to today). Streams the PDF directly as a file download.
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
