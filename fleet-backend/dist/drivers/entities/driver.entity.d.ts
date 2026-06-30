import { Company } from '../../companies/entities/company.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
export declare class Driver {
    id: number;
    company: Company;
    fullName: string;
    licenseNumber: string;
    licenseExpiry: string;
    phoneNumber: string;
    isActive: boolean;
    assignedVehicle: Vehicle | undefined;
    createdAt: Date;
}
