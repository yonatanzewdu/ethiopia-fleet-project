import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { Company } from '../companies/entities/company.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
export declare class DriversService {
    private driverRepository;
    private companyRepository;
    private vehicleRepository;
    constructor(driverRepository: Repository<Driver>, companyRepository: Repository<Company>, vehicleRepository: Repository<Vehicle>);
    create(dto: CreateDriverDto): Promise<Driver>;
    findAll(companyId?: number): Promise<Driver[]>;
    findOne(id: number): Promise<Driver>;
    update(id: number, dto: UpdateDriverDto): Promise<Driver>;
    remove(id: number): Promise<void>;
}
