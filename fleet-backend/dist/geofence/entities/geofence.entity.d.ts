import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Company } from '../../companies/entities/company.entity';
export declare class Geofence {
    id: number;
    vehicleId: number;
    vehicle: Vehicle;
    companyId: number;
    company: Company;
    lat: number;
    lng: number;
    radius: number;
    updatedAt: Date;
}
