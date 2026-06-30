import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
export declare class Company {
    id: number;
    name: string;
    createdAt: Date;
    drivers: Driver[];
    vehicles: Vehicle[];
}
