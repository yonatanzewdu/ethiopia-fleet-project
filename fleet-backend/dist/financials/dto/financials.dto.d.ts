import { ApprovalStatus, TransactionCategory } from '../entities/financial-transaction.entity';
export declare class CreateTransactionDto {
    amount: number;
    category: TransactionCategory;
    description?: string;
    receiptUrl?: string;
    approvalStatus?: ApprovalStatus;
    date: string;
    vehicleId?: number;
    companyId?: number;
    driverId?: number;
}
export declare class UpdateApprovalDto {
    approvalStatus: ApprovalStatus;
}
export declare class CreateMileageLogDto {
    vehicleId: number;
    date: string;
    odometerReading: number;
    companyId?: number;
}
