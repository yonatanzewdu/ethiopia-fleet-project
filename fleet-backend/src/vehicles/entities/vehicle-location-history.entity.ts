import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity'; // adjust path to match your project structure

/**
 * Stores every GPS ping received for a vehicle.
 * One row = one location sample at one point in time.
 *
 * The composite index on (vehicle, recordedAt) makes time-range
 * queries fast even with millions of rows.
 */
@Entity('vehicle_location_history')
@Index(['vehicle', 'recordedAt'])
export class VehicleLocationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE', nullable: false })
  vehicle: Vehicle;

  /** Latitude in decimal degrees (WGS-84) */
  @Column({ type: 'float' })
  lat: number;

  /** Longitude in decimal degrees (WGS-84) */
  @Column({ type: 'float' })
  lng: number;

  /** Speed in km/h — optional, sent by some GPS hardware */
  @Column({ type: 'float', nullable: true })
  speed: number | null;

  /** Bearing in degrees (0–360, clockwise from north) — optional */
  @Column({ type: 'float', nullable: true })
  heading: number | null;

  /** Exact UTC timestamp when the ping was recorded */
  @Index()
  @Column({ type: 'timestamp with time zone' })
  recordedAt: Date;
}
