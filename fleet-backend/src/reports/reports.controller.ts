import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsQueryDto } from './dto/reports-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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
}