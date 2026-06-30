import { GeofenceService } from './geofence.service';
import { UpsertGeofenceDto } from './dto/upsert-geofence.dto';
export declare class GeofenceController {
    private readonly svc;
    constructor(svc: GeofenceService);
    getForCompany(req: any, companyIdQuery?: string): Promise<import("./entities/geofence.entity").Geofence[]>;
    getForVehicle(vehicleId: number, req: any, companyIdQuery?: string): Promise<import("./entities/geofence.entity").Geofence | null>;
    upsertForVehicle(vehicleId: number, dto: UpsertGeofenceDto, req: any, companyIdQuery?: string): Promise<import("./entities/geofence.entity").Geofence>;
    deleteForVehicle(vehicleId: number, req: any, companyIdQuery?: string): Promise<void>;
}
