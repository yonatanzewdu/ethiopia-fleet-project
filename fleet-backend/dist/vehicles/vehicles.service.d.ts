import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Company } from '../companies/entities/company.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehiclesService {
    private vehicleRepository;
    private driverRepository;
    private companyRepository;
    constructor(vehicleRepository: Repository<Vehicle>, driverRepository: Repository<Driver>, companyRepository: Repository<Company>);
    create(dto: CreateVehicleDto): Promise<Vehicle>;
    findAll(companyId?: number): Promise<Vehicle[]>;
    findOne(id: number): Promise<Vehicle>;
    update(id: number, dto: UpdateVehicleDto): Promise<Vehicle>;
    remove(id: number): Promise<void>;
    assignDriver(vehicleId: number, driverId: number): Promise<Vehicle>;
    releaseDriver(vehicleId: number): Promise<Vehicle>;
}
