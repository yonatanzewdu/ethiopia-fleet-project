import { Repository } from 'typeorm';
import { Geofence } from './entities/geofence.entity';
import { UpsertGeofenceDto } from './dto/upsert-geofence.dto';
export declare class GeofenceService {
    private readonly geofenceRepo;
    constructor(geofenceRepo: Repository<Geofence>);
    getForCompany(companyId: number): Promise<Geofence[]>;
    getForVehicle(vehicleId: number, companyId: number): Promise<Geofence | null>;
    upsertForVehicle(vehicleId: number, companyId: number, dto: UpsertGeofenceDto): Promise<Geofence>;
    deleteForVehicle(vehicleId: number, companyId: number): Promise<void>;
}
