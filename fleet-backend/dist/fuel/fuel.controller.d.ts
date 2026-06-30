import { FuelService } from './fuel.service';
import { CreateFuelLogDto } from './dto/fuel.dto';
export declare class FuelController {
    private readonly svc;
    constructor(svc: FuelService);
    getDriverVehicle(req: any, driverIdQuery?: string, companyIdQuery?: string): Promise<import("../vehicles/entities/vehicle.entity").Vehicle>;
    driverSubmitFuelLog(body: any, file: Express.Multer.File | undefined, req: any, driverIdQuery?: string, companyIdQuery?: string): Promise<import("./entities/fuel-request.entity").FuelRequest>;
    create(dto: CreateFuelLogDto, req: any): Promise<import("./entities/fuel-log.entity").FuelLog>;
    findAll(req: any, companyIdQuery?: string, vehicleIdQuery?: string): Promise<import("./entities/fuel-log.entity").FuelLog[]>;
    summary(req: any, companyIdQuery?: string): Promise<{
        totalSpend: number;
        totalLitres: number;
        totalKm: number;
        avgLitresPer100km: number | null;
        avgPricePerLitre: number | null;
        perVehicle: Array<{
            vehicleId: number;
            totalSpend: number;
            totalLitres: number;
            totalKm: number;
            avgLitresPer100km: number | null;
        }>;
    }>;
}
