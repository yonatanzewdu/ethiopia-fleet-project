import { Repository } from 'typeorm';
import { FinancialTransaction, TransactionCategory } from '../financials/entities/financial-transaction.entity';
import { MileageLog } from '../financials/entities/mileage-log.entity';
import { ReportsQueryDto } from './dto/reports-query.dto';
export interface ExpenseBreakdownRow {
    category: TransactionCategory;
    total: number;
}
export interface CpkTrendPoint {
    period: string;
    totalApprovedExpenses: number;
    totalDistanceCovered: number;
    costPerKilometer: number | null;
}
export interface AssetUtilizationRow {
    vehicleId: number;
    plateNumber: string | null;
    totalDistanceCovered: number;
}
export interface VehicleComparisonRow {
    vehicleId: number;
    plateNumber: string | null;
    model: string | null;
    totalDistanceCovered: number;
    totalApprovedCost: number;
    costPerKilometer: number | null;
}
export interface ReportsDashboard {
    kpis: {
        cumulativeCompanySpend: number;
        totalDistanceLogged: number;
        averageFleetEfficiency: number | null;
    };
    expenseBreakdown: ExpenseBreakdownRow[];
    cpkTrend: CpkTrendPoint[];
    vehicleComparison: VehicleComparisonRow[];
}
export declare class ReportsService {
    private readonly finRepo;
    private readonly mileageRepo;
    constructor(finRepo: Repository<FinancialTransaction>, mileageRepo: Repository<MileageLog>);
    getExpenseBreakdown(companyId: number, query: ReportsQueryDto): Promise<ExpenseBreakdownRow[]>;
    getCpkTrend(companyId: number, query: ReportsQueryDto): Promise<CpkTrendPoint[]>;
    getAssetUtilization(companyId: number, query: ReportsQueryDto): Promise<AssetUtilizationRow[]>;
    getVehicleComparison(companyId: number, query: ReportsQueryDto): Promise<VehicleComparisonRow[]>;
    getDashboard(companyId: number, query: ReportsQueryDto): Promise<ReportsDashboard>;
}
