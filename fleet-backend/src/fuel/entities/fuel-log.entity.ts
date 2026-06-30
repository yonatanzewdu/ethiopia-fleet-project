import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('fuel_logs')
export class FuelLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @Column({ name: 'driver_id', nullable: true })
  driverId?: number;

  @Column({ type: 'date' })
  date: string;

  /** Litres of fuel added */
  @Column({ name: 'litres', type: 'decimal', precision: 10, scale: 2 })
  litres: number;

  /** Price per litre in ETB */
  @Column({ name: 'price_per_litre', type: 'decimal', precision: 10, scale: 2 })
  pricePerLitre: number;

  /** Total cost = litres × pricePerLitre (stored for fast querying) */
  @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2 })
  totalCost: number;

  /** Odometer reading at time of fill-up (km) */
  @Column({ name: 'odometer_reading', type: 'decimal', precision: 10, scale: 1 })
  odometerReading: number;

  /**
   * km driven since the last fill-up for this vehicle.
   * Auto-calculated on insert: current odometer − previous odometer.
   * 0 for first entry.
   */
  @Column({ name: 'km_since_last_fill', type: 'decimal', precision: 10, scale: 1, default: 0 })
  kmSinceLastFill: number;

  /**
   * Fuel consumption rate: litres / 100km.
   * null when km_since_last_fill = 0 (first entry or odometer reset).
   */
  @Column({ name: 'litres_per_100km', type: 'decimal', precision: 8, scale: 2, nullable: true })
  litresPer100km?: number;

  @Column({ name: 'notes', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
