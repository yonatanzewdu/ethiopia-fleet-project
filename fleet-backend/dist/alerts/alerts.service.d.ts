import { Repository } from 'typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Company } from '../companies/entities/company.entity';
import { AlertsSummary } from './alert.types';
export declare class AlertsService {
    private vehicleRepository;
    private driverRepository;
    private companyRepository;
    constructor(vehicleRepository: Repository<Vehicle>, driverRepository: Repository<Driver>, companyRepository: Repository<Company>);
    getCompanyAlerts(companyId: number): Promise<AlertsSummary>;
    private evaluate;
    private daysUntil;
    private toDateOnly;
}
