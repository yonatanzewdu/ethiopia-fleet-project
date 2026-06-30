import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geofence } from './entities/geofence.entity';
import { UpsertGeofenceDto } from './dto/upsert-geofence.dto';

const DEFAULT_RADIUS = 2000; // metres, used when a vehicle has no saved geofence yet

@Injectable()
export class GeofenceService {
  constructor(
    @InjectRepository(Geofence)
    private readonly geofenceRepo: Repository<Geofence>,
  ) {}

  // All geofences for a company, keyed for easy frontend lookup by vehicleId.
  async getForCompany(companyId: number): Promise<Geofence[]> {
    return this.geofenceRepo.find({ where: { companyId } });
  }

  // Single vehicle's geofence. Returns null (not 404) when none has been
  // saved yet -- the frontend falls back to a sensible default in that case.
  async getForVehicle(vehicleId: number, companyId: number): Promise<Geofence | null> {
    const geofence = await this.geofenceRepo.findOne({ where: { vehicleId } });
    if (geofence && geofence.companyId !== companyId) {
      throw new ForbiddenException('Access denied — cross-tenant operation.');
    }
    return geofence ?? null;
  }

  // Create-or-update. One geofence row per vehicle.
  async upsertForVehicle(
    vehicleId: number,
    companyId: number,
    dto: UpsertGeofenceDto,
  ): Promise<Geofence> {
    const existing = await this.geofenceRepo.findOne({ where: { vehicleId } });

    if (existing) {
      if (existing.companyId !== companyId) {
        throw new ForbiddenException('Access denied — cross-tenant operation.');
      }
      existing.lat = dto.lat;
      existing.lng = dto.lng;
      existing.radius = dto.radius ?? existing.radius;
      return this.geofenceRepo.save(existing);
    }

    const created = this.geofenceRepo.create({
      vehicleId,
      companyId,
      lat: dto.lat,
      lng: dto.lng,
      radius: dto.radius ?? DEFAULT_RADIUS,
    });
    return this.geofenceRepo.save(created);
  }

  async deleteForVehicle(vehicleId: number, companyId: number): Promise<void> {
    const existing = await this.geofenceRepo.findOne({ where: { vehicleId } });
    if (!existing) throw new NotFoundException(`No geofence set for vehicle #${vehicleId}.`);
    if (existing.companyId !== companyId) {
      throw new ForbiddenException('Access denied — cross-tenant operation.');
    }
    await this.geofenceRepo.remove(existing);
  }
}
