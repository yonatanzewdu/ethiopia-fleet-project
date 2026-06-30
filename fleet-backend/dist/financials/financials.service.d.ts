import { Repository } from 'typeorm';
import { FinancialTransaction, ApprovalStatus } from './entities/financial-transaction.entity';
import { MileageLog } from './entities/mileage-log.entity';
import { CreateTransactionDto, UpdateApprovalDto, CreateMileageLogDto } from './dto/financials.dto';
import { FuelLog } from '../fuel/entities/fuel-log.entity';
export declare class FinancialsService {
    private readonly txRepo;
    private readonly mileageRepo;
    private readonly fuelRepo;
    constructor(txRepo: Repository<FinancialTransaction>, mileageRepo: Repository<MileageLog>, fuelRepo: Repository<FuelLog>);
    createManagerTransaction(dto: CreateTransactionDto, companyId: number): Promise<FinancialTransaction>;
    createDriverReceipt(dto: CreateTransactionDto, companyId: number, driverId: number): Promise<FinancialTransaction>;
    getTransactionsByCompany(companyId: number, status?: ApprovalStatus): Promise<FinancialTransaction[]>;
    updateApprovalStatus(id: number, dto: UpdateApprovalDto, companyId: number): Promise<FinancialTransaction>;
    createMileageLog(dto: CreateMileageLogDto, companyId: number): Promise<MileageLog>;
    getMileageLogs(companyId: number, vehicleId?: number): Promise<MileageLog[]>;
    getCostPerKilometre(companyId: number): Promise<Array<{
        vehicleId: number;
        totalApprovedExpenses: number;
        totalFuelCost: number;
        totalDistanceKm: number;
        cpk: number | null;
    }>>;
    getFleetSummary(companyId: number): Promise<Array<{
        category: string;
        total: string;
    }>>;
}
