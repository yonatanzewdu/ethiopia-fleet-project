import { FinancialsService } from './financials.service';
import { CreateTransactionDto, UpdateApprovalDto, CreateMileageLogDto } from './dto/financials.dto';
import { ApprovalStatus } from './entities/financial-transaction.entity';
export declare class FinancialsController {
    private readonly svc;
    constructor(svc: FinancialsService);
    createManagerTransaction(dto: CreateTransactionDto, req: any, companyIdQuery?: string): Promise<import("./entities/financial-transaction.entity").FinancialTransaction>;
    createDriverReceipt(dto: CreateTransactionDto, req: any, companyIdQuery?: string): Promise<import("./entities/financial-transaction.entity").FinancialTransaction>;
    getTransactions(req: any, status?: ApprovalStatus, companyIdQuery?: string): Promise<import("./entities/financial-transaction.entity").FinancialTransaction[]>;
    updateApproval(id: number, dto: UpdateApprovalDto, req: any, companyIdQuery?: string): Promise<import("./entities/financial-transaction.entity").FinancialTransaction>;
    createMileageLog(dto: CreateMileageLogDto, req: any, companyIdQuery?: string): Promise<import("./entities/mileage-log.entity").MileageLog>;
    getMileageLogs(req: any, vehicleIdQuery?: string, companyIdQuery?: string): Promise<import("./entities/mileage-log.entity").MileageLog[]>;
    getCpk(req: any, companyIdQuery?: string): Promise<{
        vehicleId: number;
        totalApprovedExpenses: number;
        totalFuelCost: number;
        totalDistanceKm: number;
        cpk: number | null;
    }[]>;
    getFleetSummary(req: any, companyIdQuery?: string): Promise<{
        category: string;
        total: string;
    }[]>;
}
