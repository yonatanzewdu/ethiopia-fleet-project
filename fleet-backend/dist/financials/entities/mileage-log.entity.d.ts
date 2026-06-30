import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Company } from '../../companies/entities/company.entity';
export declare class MileageLog {
    id: number;
    date: string;
    odometerReading: number;
    distanceCovered: number;
    vehicleId: number;
    vehicle: Vehicle;
    companyId: number;
    company: Company;
    createdAt: Date;
}
