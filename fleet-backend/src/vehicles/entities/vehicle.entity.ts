import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Driver } from '../../drivers/entities/driver.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.vehicles, {
    onDelete: 'CASCADE',
  })
  company: Company;

  @OneToOne(() => Driver, (driver) => driver.assignedVehicle, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  assignedDriver: Driver | null;

  @Column({ unique: true })
  plateNumber: string;

  @Column()
  model: string;

  @Column({ unique: true })
  chassisNumber: string;

  @Column({ default: 0 })
  currentMileage: number;

  @Column({ type: 'date' })
  insuranceExpiry: string;

  @Column({ type: 'date' })
  inspectionExpiry: string;

  @CreateDateColumn()
  createdAt: Date;
}
