import { ReportsService } from './reports.service';
import { ReportsQueryDto } from './dto/reports-query.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(query: ReportsQueryDto): Promise<import("./reports.service").ReportsDashboard>;
    getExpenseBreakdown(query: ReportsQueryDto): Promise<import("./reports.service").ExpenseBreakdownRow[]>;
    getCpkTrend(query: ReportsQueryDto): Promise<import("./reports.service").CpkTrendPoint[]>;
    getAssetUtilization(query: ReportsQueryDto): Promise<import("./reports.service").AssetUtilizationRow[]>;
    getVehicleComparison(query: ReportsQueryDto): Promise<import("./reports.service").VehicleComparisonRow[]>;
}
