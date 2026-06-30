import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Company } from '../../companies/entities/company.entity';
export declare enum TransactionCategory {
    MAINTENANCE = "MAINTENANCE",
    INSURANCE = "INSURANCE",
    TIRES = "TIRES",
    REGISTRATION = "REGISTRATION",
    ROAD_TOLL = "ROAD_TOLL",
    OTHER = "OTHER"
}
export declare enum ApprovalStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class FinancialTransaction {
    id: number;
    amount: number;
    category: TransactionCategory;
    description: string;
    receiptUrl: string;
    approvalStatus: ApprovalStatus;
    date: string;
    vehicleId: number;
    vehicle: Vehicle;
    companyId: number;
    company: Company;
    driverId: number;
    createdAt: Date;
}
