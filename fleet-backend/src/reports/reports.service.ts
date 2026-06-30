import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinancialTransaction,
  ApprovalStatus,
  TransactionCategory,
} from '../financials/entities/financial-transaction.entity';
import { MileageLog } from '../financials/entities/mileage-log.entity';
import { ReportsQueryDto } from './dto/reports-query.dto';

export interface ExpenseBreakdownRow {
  category: TransactionCategory;
  total: number;
}

export interface CpkTrendPoint {
  period: string;
  totalApprovedExpenses: number;
  totalDistanceCovered: number;
  costPerKilometer: number | null;
}

export interface AssetUtilizationRow {
  vehicleId: number;
  plateNumber: string | null;
  totalDistanceCovered: number;
}

export interface VehicleComparisonRow {
  vehicleId: number;
  plateNumber: string | null;
  model: string | null;
  totalDistanceCovered: number;
  totalApprovedCost: number;
  costPerKilometer: number | null;
}

export interface ReportsDashboard {
  kpis: {
    cumulativeCompanySpend: number;
    totalDistanceLogged: number;
    averageFleetEfficiency: number | null;
  };
  expenseBreakdown: ExpenseBreakdownRow[];
  cpkTrend: CpkTrendPoint[];
  vehicleComparison: VehicleComparisonRow[];
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly finRepo: Repository<FinancialTransaction>,
    @InjectRepository(MileageLog)
    private readonly mileageRepo: Repository<MileageLog>,
  ) {}

  // ── 1. FLEET EXPENSE BREAKDOWN ─────────────────────────────────────────────
  // FIX: use camelCase property names (companyId, approvalStatus, vehicleId)
  // not snake_case DB column names. TypeORM QueryBuilder always uses the
  // TypeScript property name defined in the @Column() decorator.
  async getExpenseBreakdown(
    companyId: number,
    query: ReportsQueryDto,
  ): Promise<ExpenseBreakdownRow[]> {
    const qb = this.finRepo
      .createQueryBuilder('ft')
      .select('ft.category', 'category')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      // FIXED: was 'ft.company_id' — must be the entity property name
      .where('ft.companyId = :companyId', { companyId })
      .andWhere('ft.approvalStatus = :approved', { approved: ApprovalStatus.APPROVED })
      .andWhere('ft.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .groupBy('ft.category');

    if (query.vehicleId) {
      // FIXED: was 'ft.vehicle_id'
      qb.andWhere('ft.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
    }

    const rows = await qb.getRawMany<{ category: TransactionCategory; total: string }>();
    return rows.map((r) => ({ category: r.category, total: parseFloat(r.total) }));
  }

  // ── 2. CPK TREND OVER TIME ─────────────────────────────────────────────────
  async getCpkTrend(companyId: number, query: ReportsQueryDto): Promise<CpkTrendPoint[]> {
    const granularity = (query as any).granularity ?? 'month';
    const bucket = granularity === 'week' ? 'week' : 'month';

    const expenseQb = this.finRepo
      .createQueryBuilder('ft')
      .select(`date_trunc('${bucket}', ft.date::timestamp)`, 'period')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      // FIXED: camelCase property names throughout
      .where('ft.companyId = :companyId', { companyId })
      .andWhere('ft.approvalStatus = :approved', { approved: ApprovalStatus.APPROVED })
      .andWhere('ft.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .groupBy('period')
      .orderBy('period', 'ASC');

    const distanceQb = this.mileageRepo
      .createQueryBuilder('ml')
      .select(`date_trunc('${bucket}', ml.date::timestamp)`, 'period')
      // FIXED: was 'ml.distance_covered' — must match MileageLog entity property
      .addSelect('COALESCE(SUM(ml.distanceCovered), 0)', 'total')
      // FIXED: was 'ml.company_id'
      .where('ml.companyId = :companyId', { companyId })
      .andWhere('ml.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .andWhere('ml.distanceCovered IS NOT NULL')
      .groupBy('period')
      .orderBy('period', 'ASC');

    if (query.vehicleId) {
      // FIXED: was 'ft.vehicle_id' and 'ml.vehicle_id'
      expenseQb.andWhere('ft.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
      distanceQb.andWhere('ml.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
    }

    const [expenseRows, distanceRows] = await Promise.all([
      expenseQb.getRawMany<{ period: Date | string; total: string }>(),
      distanceQb.getRawMany<{ period: Date | string; total: string }>(),
    ]);

    // Normalise period to 'YYYY-MM-DD' string regardless of what Postgres returns
    const toKey = (p: Date | string) =>
      (p instanceof Date ? p : new Date(p)).toISOString().slice(0, 10);

    const expenseByPeriod = new Map<string, number>(
      expenseRows.map((r) => [toKey(r.period), parseFloat(r.total)]),
    );
    const distanceByPeriod = new Map<string, number>(
      distanceRows.map((r) => [toKey(r.period), parseFloat(r.total)]),
    );

    const allPeriods = Array.from(
      new Set([...expenseByPeriod.keys(), ...distanceByPeriod.keys()]),
    ).sort();

    return allPeriods.map((period) => {
      const totalApprovedExpenses = expenseByPeriod.get(period) ?? 0;
      const totalDistanceCovered  = distanceByPeriod.get(period) ?? 0;
      return {
        period,
        totalApprovedExpenses,
        totalDistanceCovered,
        costPerKilometer:
          totalDistanceCovered > 0
            ? parseFloat((totalApprovedExpenses / totalDistanceCovered).toFixed(4))
            : null,
      };
    });
  }

  // ── 3. ASSET UTILIZATION & MILEAGE ────────────────────────────────────────
  async getAssetUtilization(
    companyId: number,
    query: ReportsQueryDto,
  ): Promise<AssetUtilizationRow[]> {
    const qb = this.mileageRepo
      .createQueryBuilder('ml')
      .leftJoin('ml.vehicle', 'vehicle')
      // FIXED: was 'ml.vehicle_id' — use property name 'vehicleId'
      .select('ml.vehicleId', 'vehicleId')
      .addSelect('vehicle.plateNumber', 'plateNumber')
      .addSelect('COALESCE(SUM(ml.distanceCovered), 0)', 'totalDistanceCovered')
      // FIXED: was 'ml.company_id'
      .where('ml.companyId = :companyId', { companyId })
      .andWhere('ml.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .andWhere('ml.distanceCovered IS NOT NULL')
      .groupBy('ml.vehicleId')
      .addGroupBy('vehicle.plateNumber');

    if (query.vehicleId) {
      qb.andWhere('ml.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
    }

    const rows = await qb.getRawMany<{
      vehicleId: string;
      plateNumber: string | null;
      totalDistanceCovered: string;
    }>();

    return rows.map((r) => ({
      vehicleId: Number(r.vehicleId),
      plateNumber: r.plateNumber,
      totalDistanceCovered: parseFloat(r.totalDistanceCovered),
    }));
  }

  // ── 4. VEHICLE COMPARISON TABLE ───────────────────────────────────────────
  async getVehicleComparison(
    companyId: number,
    query: ReportsQueryDto,
  ): Promise<VehicleComparisonRow[]> {
    const expenseQb = this.finRepo
      .createQueryBuilder('ft')
      .leftJoin('ft.vehicle', 'vehicle')
      // FIXED: was 'ft.vehicle_id'
      .select('ft.vehicleId', 'vehicleId')
      .addSelect('vehicle.plateNumber', 'plateNumber')
      .addSelect('vehicle.model', 'model')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      // FIXED: was 'ft.company_id'
      .where('ft.companyId = :companyId', { companyId })
      .andWhere('ft.approvalStatus = :approved', { approved: ApprovalStatus.APPROVED })
      .andWhere('ft.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .andWhere('ft.vehicleId IS NOT NULL')
      .groupBy('ft.vehicleId')
      .addGroupBy('vehicle.plateNumber')
      .addGroupBy('vehicle.model');

    if (query.vehicleId) {
      expenseQb.andWhere('ft.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
    }

    const [expenseRows, utilizationRows] = await Promise.all([
      expenseQb.getRawMany<{
        vehicleId: string;
        plateNumber: string | null;
        model: string | null;
        total: string;
      }>(),
      this.getAssetUtilization(companyId, query),
    ]);

    const costByVehicle = new Map(
      expenseRows.map((r) => [Number(r.vehicleId), {
        total: parseFloat(r.total),
        plateNumber: r.plateNumber,
        model: r.model,
      }]),
    );

    const vehicleIds = new Set<number>([
      ...costByVehicle.keys(),
      ...utilizationRows.map((r) => r.vehicleId),
    ]);

    return Array.from(vehicleIds).map((vid) => {
      const utilization    = utilizationRows.find((r) => r.vehicleId === vid);
      const costEntry      = costByVehicle.get(vid);
      const totalApprovedCost      = costEntry?.total ?? 0;
      const totalDistanceCovered   = utilization?.totalDistanceCovered ?? 0;
      return {
        vehicleId:            vid,
        plateNumber:          costEntry?.plateNumber ?? utilization?.plateNumber ?? null,
        model:                costEntry?.model ?? null,
        totalDistanceCovered,
        totalApprovedCost,
        costPerKilometer:
          totalDistanceCovered > 0
            ? parseFloat((totalApprovedCost / totalDistanceCovered).toFixed(4))
            : null,
      };
    });
  }

  // ── COMBINED DASHBOARD ────────────────────────────────────────────────────
  async getDashboard(companyId: number, query: ReportsQueryDto): Promise<ReportsDashboard> {
    const [expenseBreakdown, cpkTrend, vehicleComparison] = await Promise.all([
      this.getExpenseBreakdown(companyId, query),
      this.getCpkTrend(companyId, query),
      this.getVehicleComparison(companyId, query),
    ]);

    const cumulativeCompanySpend = expenseBreakdown.reduce((s, r) => s + r.total, 0);
    const totalDistanceLogged    = vehicleComparison.reduce((s, r) => s + r.totalDistanceCovered, 0);
    const averageFleetEfficiency =
      totalDistanceLogged > 0
        ? parseFloat((cumulativeCompanySpend / totalDistanceLogged).toFixed(4))
        : null;

    return {
      kpis: { cumulativeCompanySpend, totalDistanceLogged, averageFleetEfficiency },
      expenseBreakdown,
      cpkTrend,
      vehicleComparison,
    };
  }
}