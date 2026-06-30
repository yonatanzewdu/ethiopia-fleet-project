import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinancialTransaction,
  ApprovalStatus,
} from './entities/financial-transaction.entity';
import { MileageLog } from './entities/mileage-log.entity';
import {
  CreateTransactionDto,
  UpdateApprovalDto,
  CreateMileageLogDto,
} from './dto/financials.dto';
import { FuelLog } from '../fuel/entities/fuel-log.entity';

@Injectable()
export class FinancialsService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly txRepo: Repository<FinancialTransaction>,

    @InjectRepository(MileageLog)
    private readonly mileageRepo: Repository<MileageLog>,

    @InjectRepository(FuelLog)
    private readonly fuelRepo: Repository<FuelLog>,
  ) {}

  // ── TRANSACTIONS ────────────────────────────────────────────────────────────

async createManagerTransaction(
  dto: CreateTransactionDto,
  companyId: number,
): Promise<FinancialTransaction> {
  const tx = this.txRepo.create({
    amount:      dto.amount,
    category:    dto.category,
    description: dto.description,
    receiptUrl:  dto.receiptUrl,
    date:        dto.date,
    vehicleId:   dto.vehicleId ? Number(dto.vehicleId) : undefined,
    driverId:    dto.driverId  ? Number(dto.driverId)  : undefined,
    companyId,
    approvalStatus: ApprovalStatus.APPROVED,
  });
  return this.txRepo.save(tx);
}
  async createDriverReceipt(
    dto: CreateTransactionDto,
    companyId: number,
    driverId: number,
  ): Promise<FinancialTransaction> {
    const tx = this.txRepo.create({
      ...dto,
      companyId,
      driverId,
      approvalStatus: ApprovalStatus.PENDING,
    });
    return this.txRepo.save(tx);
  }

  async getTransactionsByCompany(
    companyId: number,
    status?: ApprovalStatus,
  ): Promise<FinancialTransaction[]> {
    const qb = this.txRepo
      .createQueryBuilder('tx')
      .where('tx.company_id = :companyId', { companyId })
      .orderBy('tx.created_at', 'DESC');

    if (status) {
      qb.andWhere('tx.approval_status = :status', { status });
    }

    return qb.getMany();
  }

  async updateApprovalStatus(
    id: number,
    dto: UpdateApprovalDto,
    companyId: number,
  ): Promise<FinancialTransaction> {
    const tx = await this.txRepo.findOne({ where: { id } });
    if (!tx) throw new NotFoundException(`Transaction #${id} not found.`);
    if (tx.companyId !== companyId) {
      throw new ForbiddenException('Access denied — cross-tenant operation.');
    }
    tx.approvalStatus = dto.approvalStatus;
    return this.txRepo.save(tx);
  }

  // ── MILEAGE LOGS ─────────────────────────────────────────────────────────────

  async createMileageLog(
    dto: CreateMileageLogDto,
    companyId: number,
  ): Promise<MileageLog> {
    const previous = await this.mileageRepo.findOne({
      where: { vehicleId: dto.vehicleId, companyId },
      order: { createdAt: 'DESC' },
    });

    const distanceCovered = previous
      ? Math.max(0, dto.odometerReading - Number(previous.odometerReading))
      : 0;

    const log = this.mileageRepo.create({
      ...dto,
      companyId,
      distanceCovered,
    });
    return this.mileageRepo.save(log);
  }

  async getMileageLogs(
    companyId: number,
    vehicleId?: number,
  ): Promise<MileageLog[]> {
    const qb = this.mileageRepo
      .createQueryBuilder('ml')
      .where('ml.company_id = :companyId', { companyId })
      .orderBy('ml.created_at', 'DESC');

    if (vehicleId) {
      qb.andWhere('ml.vehicle_id = :vehicleId', { vehicleId });
    }

    return qb.getMany();
  }

  // ── CPK ENGINE ───────────────────────────────────────────────────────────────

  async getCostPerKilometre(companyId: number): Promise<
    Array<{
      vehicleId: number;
      totalApprovedExpenses: number;
      totalFuelCost: number;
      totalDistanceKm: number;
      cpk: number | null;
    }>
  > {
    // Step 1: approved non-fuel expenses per vehicle
    const expenseRows: Array<{ vehicleId: number; totalExpenses: string }> =
      await this.txRepo
        .createQueryBuilder('tx')
        .select('tx.vehicle_id', 'vehicleId')
        .addSelect('SUM(tx.amount)', 'totalExpenses')
        .where('tx.company_id = :companyId',        { companyId })
        .andWhere('tx.approval_status = :approved', { approved: ApprovalStatus.APPROVED })
        .andWhere("tx.category::text != 'FUEL'")    // ← cast to text to avoid enum error
        .groupBy('tx.vehicle_id')
        .getRawMany();

    // Step 2: fuel costs per vehicle from fuel_logs
    const fuelRows: Array<{ vehicleId: number; totalFuel: string }> =
      await this.fuelRepo
        .createQueryBuilder('fl')
        .select('fl.vehicle_id', 'vehicleId')
        .addSelect('SUM(fl.total_cost)', 'totalFuel')
        .where('fl.company_id = :companyId', { companyId })
        .groupBy('fl.vehicle_id')
        .getRawMany();

    // Step 3: distance per vehicle from mileage_logs
    const distanceRows: Array<{ vehicleId: number; totalDistance: string }> =
      await this.mileageRepo
        .createQueryBuilder('ml')
        .select('ml.vehicle_id', 'vehicleId')
        .addSelect('SUM(ml.distance_covered)', 'totalDistance')
        .where('ml.company_id = :companyId', { companyId })
        .groupBy('ml.vehicle_id')
        .getRawMany();

    // Step 4: unified map over all vehicle IDs
    const vehicleIds = new Set([
      ...expenseRows.map((r)  => Number(r.vehicleId)),
      ...fuelRows.map((r)     => Number(r.vehicleId)),
      ...distanceRows.map((r) => Number(r.vehicleId)),
    ]);

    const expenseMap  = new Map(expenseRows.map((r)  => [Number(r.vehicleId), parseFloat(r.totalExpenses)]));
    const fuelMap     = new Map(fuelRows.map((r)     => [Number(r.vehicleId), parseFloat(r.totalFuel)]));
    const distanceMap = new Map(distanceRows.map((r) => [Number(r.vehicleId), parseFloat(r.totalDistance)]));

    return Array.from(vehicleIds).map((vehicleId) => {
      const totalApprovedExpenses = expenseMap.get(vehicleId)  ?? 0;
      const totalFuelCost         = fuelMap.get(vehicleId)     ?? 0;
      const totalDistanceKm       = distanceMap.get(vehicleId) ?? 0;
      const totalCost             = totalApprovedExpenses + totalFuelCost;

      const cpk =
        totalDistanceKm > 0
          ? parseFloat((totalCost / totalDistanceKm).toFixed(4))
          : null;

      return { vehicleId, totalApprovedExpenses, totalFuelCost, totalDistanceKm, cpk };
    });
  }

  // ── SUMMARY (fleet-level) ────────────────────────────────────────────────────

  async getFleetSummary(
    companyId: number,
  ): Promise<Array<{ category: string; total: string }>> {
    // Approved transactions from financial_transactions table
    const txRows: Array<{ category: string; total: string }> =
      await this.txRepo
        .createQueryBuilder('tx')
        .select('tx.category', 'category')
        .addSelect('SUM(tx.amount)', 'total')
        .where('tx.company_id = :companyId', { companyId })
        .andWhere('tx.approval_status = :approved', { approved: ApprovalStatus.APPROVED })
        .groupBy('tx.category')
        .getRawMany();

    // Fuel total from fuel_logs table
    const fuelTotalRow = await this.fuelRepo
      .createQueryBuilder('fl')
      .select('SUM(fl.total_cost)', 'total')
      .where('fl.company_id = :companyId', { companyId })
      .getRawOne();

    const fuelTotal = parseFloat(fuelTotalRow?.total || '0');

    // Merge fuel into the summary as its own FUEL category row
    if (fuelTotal > 0) {
      const existingFuel = txRows.find((r) => r.category === 'FUEL');
      if (existingFuel) {
        existingFuel.total = String(parseFloat(existingFuel.total) + fuelTotal);
      } else {
        txRows.push({ category: 'FUEL', total: String(fuelTotal) });
      }
    }

    return txRows;
  }
}