import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Company } from '../../companies/entities/company.entity';

export enum TransactionCategory {
  MAINTENANCE  = 'MAINTENANCE',
  INSURANCE    = 'INSURANCE',
  TIRES        = 'TIRES',
  REGISTRATION = 'REGISTRATION',
  ROAD_TOLL    = 'ROAD_TOLL',
  OTHER        = 'OTHER',
}

export enum ApprovalStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('financial_transactions')
export class FinancialTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionCategory })
  category: TransactionCategory;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl: string;

  @Column({
    name: 'approval_status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.APPROVED,
  })
  approvalStatus: ApprovalStatus;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'vehicle_id', nullable: true })
  vehicleId: number;

  @ManyToOne(() => Vehicle, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'driver_id', nullable: true })
  driverId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}