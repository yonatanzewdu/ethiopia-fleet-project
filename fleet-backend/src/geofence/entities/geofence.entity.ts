import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Company } from '../../companies/entities/company.entity';

// One geofence per vehicle (not per company). vehicleId is unique so each
// vehicle has at most one geofence row -- the service uses upsert semantics
// (find by vehicleId, update if exists, otherwise create).
@Entity('geofences')
export class Geofence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vehicle_id', unique: true })
  vehicleId: number;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  // Denormalized company_id so tenant-scoped queries don't need a join.
  @Column({ name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column('decimal', { precision: 9, scale: 6 })
  lat: number;

  @Column('decimal', { precision: 9, scale: 6 })
  lng: number;

  @Column({ type: 'int', default: 2000 })
  radius: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
