import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Driver } from '../../drivers/entities/driver.entity'; // adjust path/filename if yours differs

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: 'driver',
  })
  role: 'admin' | 'manager' | 'driver';

  @Column({
    name: 'company_id',
    nullable: true,
    type: 'int',
  })
  companyId: number | null;

  @ManyToOne(() => Company, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'company_id' })
  company: Company | null;

  // NEW: links a driver-role login account to its actual Driver record
  // (the table that holds fullName, licenseNumber, etc.). Nullable because
  // admin/manager accounts will never have one.
  @Column({
    name: 'driver_id',
    nullable: true,
    type: 'int',
  })
  driverId: number | null;

  @ManyToOne(() => Driver, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}