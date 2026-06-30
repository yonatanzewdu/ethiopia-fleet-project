import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.drivers, {
    onDelete: 'CASCADE',
  })
  company: Company;

  @Column()
  fullName: string;

  @Column({ unique: true })
  licenseNumber: string;

  @Column({ type: 'date' })
  licenseExpiry: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.assignedDriver, {
    nullable: true,
  })
  @JoinColumn()
  assignedVehicle: Vehicle | undefined;

  @CreateDateColumn()
  createdAt: Date;
}
