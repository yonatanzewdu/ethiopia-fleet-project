import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(createVehicleDto: CreateVehicleDto): Promise<import("./entities/vehicle.entity").Vehicle>;
    findAll(companyId?: string): Promise<import("./entities/vehicle.entity").Vehicle[]>;
    findOne(id: number): Promise<import("./entities/vehicle.entity").Vehicle>;
    update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<import("./entities/vehicle.entity").Vehicle>;
    remove(id: number): Promise<void>;
    assignDriver(id: number, driverId: number): Promise<import("./entities/vehicle.entity").Vehicle>;
    releaseDriver(id: number): Promise<import("./entities/vehicle.entity").Vehicle>;
}
