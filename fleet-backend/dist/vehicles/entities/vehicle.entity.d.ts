import { Company } from '../../companies/entities/company.entity';
import { Driver } from '../../drivers/entities/driver.entity';
export declare class Vehicle {
    id: number;
    company: Company;
    assignedDriver: Driver | null;
    plateNumber: string;
    model: string;
    chassisNumber: string;
    currentMileage: number;
    insuranceExpiry: string;
    inspectionExpiry: string;
    createdAt: Date;
}
