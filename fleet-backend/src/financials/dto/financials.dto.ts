import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional,
  IsString, IsDateString, Min,
} from 'class-validator';
import { ApprovalStatus, TransactionCategory } from '../entities/financial-transaction.entity';

// ── CREATE TRANSACTION ────────────────────────────────────────────────────────

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than zero.' })
  amount: number;

  @IsEnum(TransactionCategory, { message: 'Invalid expense category.' })
  category: TransactionCategory;

  @IsOptional()
  @IsString()
  description?: string;

  /** Optional base-64 string or a URL pointing to the uploaded receipt image. */
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  /**
   * Callers MUST NOT set this directly.
   * The service layer enforces:
   *   - APPROVED for manager-entered transactions
   *   - PENDING  for driver-submitted ones
   */
  approvalStatus?: ApprovalStatus;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  vehicleId?: number;

  /** Populated automatically from the authenticated session; not a body field. */
  @IsOptional()
  @IsNumber()
  companyId?: number;

  /** Populated automatically for driver submissions. */
  @IsOptional()
  @IsNumber()
  driverId?: number;
}

// ── UPDATE APPROVAL STATUS ────────────────────────────────────────────────────

export class UpdateApprovalDto {
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  approvalStatus: ApprovalStatus;
}

// ── CREATE MILEAGE LOG ────────────────────────────────────────────────────────

export class CreateMileageLogDto {
  @IsNumber()
  @IsNotEmpty()
  vehicleId: number;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  odometerReading: number;

  @IsOptional()
  @IsNumber()
  companyId?: number;
}