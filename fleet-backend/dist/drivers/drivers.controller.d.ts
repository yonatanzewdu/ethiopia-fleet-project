import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
    create(createDriverDto: CreateDriverDto): Promise<import("./entities/driver.entity").Driver>;
    findAll(companyId?: string): Promise<import("./entities/driver.entity").Driver[]>;
    findOne(id: number): Promise<import("./entities/driver.entity").Driver>;
    update(id: number, updateDriverDto: UpdateDriverDto): Promise<import("./entities/driver.entity").Driver>;
    remove(id: number): Promise<void>;
}
