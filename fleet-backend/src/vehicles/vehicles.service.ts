import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Company } from '../companies/entities/company.entity';
import { VehicleLocationHistory } from './entities/vehicle-location-history.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(VehicleLocationHistory)
    private locationHistoryRepository: Repository<VehicleLocationHistory>,
  ) {}

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const company = await this.companyRepository.findOne({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company #${dto.companyId} not found`);
    }

    const existing = await this.vehicleRepository.findOne({
      where: { plateNumber: dto.plateNumber },
    });
    if (existing) {
      throw new BadRequestException(
        'A vehicle with this plate number already exists.',
      );
    }

    const vehicle = this.vehicleRepository.create({ ...dto, company });
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(companyId?: number): Promise<Vehicle[]> {
    const where: any = companyId ? { company: { id: companyId } } : {};
    return this.vehicleRepository.find({
      where,
      relations: { company: true, assignedDriver: true },
    });
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: { company: true, assignedDriver: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle #${id} not found`);
    }
    return vehicle;
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, dto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: number): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
  }

  async assignDriver(vehicleId: number, driverId: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: { company: true, assignedDriver: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle #${vehicleId} not found`);
    }

    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: { company: true },
    });
    if (!driver) {
      throw new NotFoundException(`Driver #${driverId} not found`);
    }

    // Multi-tenant security check: both assets must belong to the same company
    if (vehicle.company.id !== driver.company.id) {
      throw new BadRequestException(
        'Vehicle and driver do not belong to the same company.',
      );
    }

    vehicle.assignedDriver = driver;
    return this.vehicleRepository.save(vehicle);
  }

  async releaseDriver(vehicleId: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: { company: true, assignedDriver: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle #${vehicleId} not found`);
    }

    if (!vehicle.assignedDriver) {
      throw new BadRequestException(
        `Vehicle #${vehicleId} has no assigned driver to release.`,
      );
    }

    vehicle.assignedDriver = null;
    return this.vehicleRepository.save(vehicle);
  }

  // ── GPS HISTORY ────────────────────────────────────────────────────────────

  /**
   * Return all recorded GPS pings for a vehicle within [from, to].
   * Results are ordered chronologically (oldest → newest).
   */
  async getLocationHistory(
    vehicleId: number,
    from: Date,
    to: Date,
  ): Promise<VehicleLocationHistory[]> {
    await this.findOne(vehicleId); // throws 404 if vehicle doesn't exist

    return this.locationHistoryRepository.find({
      where: {
        vehicle: { id: vehicleId },
        recordedAt: Between(from, to),
      },
      order: { recordedAt: 'ASC' },
    });
  }

  /**
   * Record a single GPS ping for a vehicle.
   * Called by your telematics ingestion pipeline (WebSocket / HTTP push).
   */
  async recordLocation(
    vehicleId: number,
    lat: number,
    lng: number,
    speed?: number,
    heading?: number,
  ): Promise<VehicleLocationHistory> {
    const vehicle = await this.findOne(vehicleId);

    // Also update the vehicle's current position so the live map stays current
    vehicle.lat = lat;
    vehicle.lng = lng;
    await this.vehicleRepository.save(vehicle);

    const point = this.locationHistoryRepository.create({
      vehicle,
      lat,
      lng,
      speed:   speed   ?? null,
      heading: heading ?? null,
      recordedAt: new Date(),
    });
    return this.locationHistoryRepository.save(point);
  }
}
