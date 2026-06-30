import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum FuelRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('fuel_requests')
@Index(['companyId'])
export class FuelRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountEtb: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  litresFilled: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerLitre: number;

  @Column({ type: 'decimal', precision: 10, scale: 1 })
  odometerReading: number;

  @Column({ type: 'varchar', nullable: true })
  receiptImage: string | null;

  @Column({ type: 'enum', enum: FuelRequestStatus, default: FuelRequestStatus.PENDING })
  status: FuelRequestStatus;

  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @Column({ name: 'company_id' })
  companyId: number; // Matched to your existing number type

  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @Column({ name: 'driver_id' })
  driverId: number;
}