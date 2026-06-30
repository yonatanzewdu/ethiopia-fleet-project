import { Company } from '../../companies/entities/company.entity';
import { Driver } from '../../drivers/entities/driver.entity';
export declare class User {
    id: number;
    username: string;
    password: string;
    role: 'admin' | 'manager' | 'driver';
    companyId: number | null;
    company: Company | null;
    driverId: number | null;
    driver: Driver | null;
    createdAt: Date;
}
