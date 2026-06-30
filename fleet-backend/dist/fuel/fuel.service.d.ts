import { Repository } from 'typeorm';
import { FuelLog } from './entities/fuel-log.entity';
import { CreateFuelLogDto } from './dto/fuel.dto';
import { MileageLog } from '../financials/entities/mileage-log.entity';
import { FuelRequest } from './entities/fuel-request.entity';
import { Driver } from '../drivers/entities/driver.entity';
export declare class FuelService {
    private readonly fuelRepo;
    private readonly mileageRepo;
    private readonly fuelRequestRepo;
    private readonly driverRepo;
    constructor(fuelRepo: Repository<FuelLog>, mileageRepo: Repository<MileageLog>, fuelRequestRepo: Repository<FuelRequest>, driverRepo: Repository<Driver>);
    getAssignedVehicleForDriver(driverId: number, companyId: number): Promise<import("../vehicles/entities/vehicle.entity").Vehicle>;
    createFuelRequest(driverId: number, companyId: number, data: {
        vehicleId: number;
        litresFilled: number;
        pricePerLitre: number;
        odometerReading: number;
        amountEtb: number;
    }, receiptImagePath?: string): Promise<FuelRequest>;
    createFuelLog(dto: CreateFuelLogDto, companyId: number): Promise<FuelLog>;
    getFuelLogs(companyId: number, vehicleId?: number): Promise<FuelLog[]>;
    getFuelSummary(companyId: number): Promise<{
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
