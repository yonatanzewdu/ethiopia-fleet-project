import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Existing Entities & DTOs
import { FuelLog } from './entities/fuel-log.entity';
import { CreateFuelLogDto } from './dto/fuel.dto';
import { MileageLog } from '../financials/entities/mileage-log.entity';

// New Entity for Driver Submissions
import { FuelRequest, FuelRequestStatus } from './entities/fuel-request.entity';

// Needed for the real driver -> vehicle lookup chain
import { Driver } from '../drivers/entities/driver.entity';

@Injectable()
export class FuelService {
  constructor(
    @InjectRepository(FuelLog)
    private readonly fuelRepo: Repository<FuelLog>,

    @InjectRepository(MileageLog)
    private readonly mileageRepo: Repository<MileageLog>,

    @InjectRepository(FuelRequest)
    private readonly fuelRequestRepo: Repository<FuelRequest>,

    // FIX: real Driver repo replaces the hardcoded mock vehicle.
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
  ) {}

  // =======================================================================
  // 1. DRIVER PIPELINE METHODS
  // =======================================================================

  /**
   * Resolves the real vehicle assigned to a driver via the
   * Driver -> assignedVehicle (OneToOne) relation, scoped to companyId
   * for tenant isolation.
   *
   * FIX: previously returned a hardcoded mock `{ id: 1, name: 'Toyota Hilux' }`
   * with no plateNumber, which is why the frontend showed "undefined".
   */
  async getAssignedVehicleForDriver(driverId: number, companyId: number) {
    if (!driverId) {
      throw new NotFoundException('No driverId provided — cannot resolve assigned vehicle.');
    }

    const driver = await this.driverRepo.findOne({
      where: { id: driverId, company: { id: companyId } },
      relations: { assignedVehicle: true },
    });

    if (!driver) {
      throw new NotFoundException(`Driver #${driverId} not found for this company.`);
    }

    if (!driver.assignedVehicle) {
      throw new NotFoundException('No active vehicle asset mapped to this driver account.');
    }

    return driver.assignedVehicle;
  }

  /**
   * Creates a PENDING fuel request submitted by a driver from the mobile
   * console, with an optional receipt image (saved by the controller's
   * FileInterceptor before this is called -- `receiptImagePath` is the
   * already-saved file path, not the raw file).
   */
  async createFuelRequest(
    driverId: number,
    companyId: number,
    data: {
      vehicleId: number;
      litresFilled: number;
      pricePerLitre: number;
      odometerReading: number;
      amountEtb: number;
    },
    receiptImagePath?: string,
  ) {
    if (!driverId || !companyId) {
      throw new ForbiddenException('Missing driver or company context for this request.');
    }
    if (!data || data.vehicleId === undefined || data.vehicleId === null) {
      throw new ForbiddenException('Missing vehicleId in fuel request payload.');
    }

    const vehicle = await this.getAssignedVehicleForDriver(driverId, companyId);

    // FIX: data.vehicleId arrives as a string from multipart/form-data;
    // compare loosely-coerced numbers, not strict !==.
    if (Number(vehicle.id) !== Number(data.vehicleId)) {
      throw new ForbiddenException('Unauthorized: You can only submit fuel logs for your assigned vehicle.');
    }

    const request = this.fuelRequestRepo.create({
      vehicleId: Number(data.vehicleId),
      litresFilled: Number(data.litresFilled),
      pricePerLitre: Number(data.pricePerLitre),
      odometerReading: Number(data.odometerReading),
      amountEtb: Number(data.amountEtb),
      receiptImage: receiptImagePath ?? null,
      driverId,
      companyId,
      status: FuelRequestStatus.PENDING,
    });

    return await this.fuelRequestRepo.save(request);
  }

  // =======================================================================
  // 2. CORE FUEL METRICS & LOGGING (unchanged)
  // =======================================================================

  async createFuelLog(dto: CreateFuelLogDto, companyId: number): Promise<FuelLog> {
    const totalCost = Number(dto.litres) * Number(dto.pricePerLitre);

    const previous = await this.fuelRepo.findOne({
      where: { vehicleId: dto.vehicleId, companyId },
      order: { createdAt: 'DESC' },
    });

    const kmSinceLastFill = previous
      ? Math.max(0, dto.odometerReading - Number(previous.odometerReading))
      : 0;

    const litresPer100km =
      kmSinceLastFill > 0
        ? parseFloat(((Number(dto.litres) / kmSinceLastFill) * 100).toFixed(2))
        : undefined;

    const log = this.fuelRepo.create({
      vehicleId:       dto.vehicleId,
      driverId:        dto.driverId,
      date:            dto.date,
      litres:          dto.litres,
      pricePerLitre:   dto.pricePerLitre,
      odometerReading: dto.odometerReading,
      notes:           dto.notes,
      companyId,
      totalCost:       parseFloat(totalCost.toFixed(2)),
      kmSinceLastFill,
      litresPer100km,
    });

    const saved = await this.fuelRepo.save(log);

    const prevMileage = await this.mileageRepo.findOne({
      where: { vehicleId: dto.vehicleId, companyId },
      order: { createdAt: 'DESC' },
    });

    const distanceCovered = prevMileage
      ? Math.max(0, dto.odometerReading - Number(prevMileage.odometerReading))
      : 0;

    const alreadyLogged = await this.mileageRepo.findOne({
      where: {
        vehicleId: dto.vehicleId,
        companyId,
        odometerReading: dto.odometerReading,
      },
    });

    if (!alreadyLogged) {
      const mileageLog = this.mileageRepo.create({
        vehicleId:       dto.vehicleId,
        companyId,
        date:            dto.date,
        odometerReading: dto.odometerReading,
        distanceCovered,
      });
      await this.mileageRepo.save(mileageLog);
    }

    return saved;
  }

  async getFuelLogs(companyId: number, vehicleId?: number): Promise<FuelLog[]> {
    const qb = this.fuelRepo
      .createQueryBuilder('fl')
      .where('fl.company_id = :companyId', { companyId })
      .orderBy('fl.created_at', 'DESC');

    if (vehicleId) {
      qb.andWhere('fl.vehicle_id = :vehicleId', { vehicleId });
    }

    return qb.getMany();
  }

  async getFuelSummary(companyId: number): Promise<{
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
  }> {
    const rows = await this.fuelRepo
      .createQueryBuilder('fl')
      .select('fl.vehicle_id', 'vehicleId')
      .addSelect('SUM(fl.total_cost)',        'totalSpend')
      .addSelect('SUM(fl.litres)',             'totalLitres')
      .addSelect('SUM(fl.km_since_last_fill)', 'totalKm')
      .addSelect('AVG(fl.litres_per_100km)',   'avgLitresPer100km')
      .addSelect('AVG(fl.price_per_litre)',    'avgPricePerLitre')
      .where('fl.company_id = :companyId', { companyId })
      .groupBy('fl.vehicle_id')
      .getRawMany();

    const totalSpend        = rows.reduce((a, r) => a + parseFloat(r.totalSpend  || 0), 0);
    const totalLitres       = rows.reduce((a, r) => a + parseFloat(r.totalLitres || 0), 0);
    const totalKm           = rows.reduce((a, r) => a + parseFloat(r.totalKm     || 0), 0);
    const avgLitresPer100km = totalKm > 0 ? parseFloat(((totalLitres / totalKm) * 100).toFixed(2)) : null;
    const avgPricePerLitre  = rows.length > 0
      ? parseFloat((rows.reduce((a, r) => a + parseFloat(r.avgPricePerLitre || 0), 0) / rows.length).toFixed(2))
      : null;

    return {
      totalSpend,
      totalLitres,
      totalKm,
      avgLitresPer100km,
      avgPricePerLitre,
      perVehicle: rows.map((r) => ({
        vehicleId:         Number(r.vehicleId),
        totalSpend:        parseFloat(r.totalSpend  || 0),
        totalLitres:       parseFloat(r.totalLitres || 0),
        totalKm:           parseFloat(r.totalKm     || 0),
        avgLitresPer100km: r.avgLitresPer100km ? parseFloat(r.avgLitresPer100km) : null,
      })),
    };
  }
}