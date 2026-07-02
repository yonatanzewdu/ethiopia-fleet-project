import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinancialTransaction,
  ApprovalStatus,
  TransactionCategory,
} from '../financials/entities/financial-transaction.entity';
import { MileageLog } from '../financials/entities/mileage-log.entity';
import { FuelLog } from '../fuel/entities/fuel-log.entity';
import { ReportsQueryDto } from './dto/reports-query.dto';

export interface ExpenseBreakdownRow {
  category: TransactionCategory | 'fuel';
  total: number;
}

export interface CpkTrendPoint {
  period: string;
  totalApprovedExpenses: number;
  fuelCost: number;
  totalCost: number;
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
  totalFuelCost: number;
  totalCost: number;
  costPerKilometer: number | null;
}

export interface FuelSummaryReport {
  totalFuelSpend: number;
  totalLitres: number;
  avgPricePerLitre: number | null;
  avgLitresPer100km: number | null;
  perVehicle: Array<{
    vehicleId: number;
    plateNumber: string | null;
    totalSpend: number;
    totalLitres: number;
    totalKm: number;
    avgLitresPer100km: number | null;
  }>;
}

export interface ReportsDashboard {
  kpis: {
    cumulativeCompanySpend: number;
    totalFuelSpend: number;
    totalCombinedSpend: number;
    totalDistanceLogged: number;
    averageFleetEfficiency: number | null;
    avgFuelPricePerLitre: number | null;
    avgLitresPer100km: number | null;
  };
  expenseBreakdown: ExpenseBreakdownRow[];
  fuelSummary: FuelSummaryReport;
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
    @InjectRepository(FuelLog)
    private readonly fuelRepo: Repository<FuelLog>,
  ) {}

  // ── INTERNAL: total fuel spend in date range ───────────────────────────────
  private async getFuelTotalInRange(
    companyId: number,
    query: ReportsQueryDto,
  ): Promise<number> {
    const qb = this.fuelRepo
      .createQueryBuilder('fl')
      .select('COALESCE(SUM(fl.total_cost), 0)', 'total')
      .where('fl.company_id = :companyId', { companyId })
      .andWhere('fl.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });

    if (query.vehicleId) {
      qb.andWhere('fl.vehicle_id = :vehicleId', { vehicleId: query.vehicleId });
    }

    const row = await qb.getRawOne<{ total: string }>();
    return parseFloat(row?.total ?? '0');
  }

  // ── 1. FLEET EXPENSE BREAKDOWN ─────────────────────────────────────────────
  async getExpenseBreakdown(
    companyId: number,
    query: ReportsQueryDto,
  ): Promise<ExpenseBreakdownRow[]> {
    const qb = this.finRepo
      .createQueryBuilder('ft')
      .select('ft.category', 'category')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      .where('ft.companyId = :companyId', { companyId })
      .andWhere('ft.approvalStatus = :approved', { approved: ApprovalStatus.APPROVED })
      .andWhere('ft.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .groupBy('ft.category');

    if (query.vehicleId) {
      qb.andWhere('ft.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
    }

    const rows = await qb.getRawMany<{ category: TransactionCategory; total: string }>();
    const result: ExpenseBreakdownRow[] = rows.map((r) => ({
      category: r.category,
      total: parseFloat(r.total),
    }));

    // Append fuel as its own category so it appears in the breakdown bar chart
    const fuelTotal = await this.getFuelTotalInRange(companyId, query);
    if (fuelTotal > 0) {
      result.push({ category: 'fuel', total: fuelTotal });
    }

    return result;
  }

  // ── 2. FUEL SUMMARY REPORT ─────────────────────────────────────────────────
  // NOTE: FuelLog has no vehicle relation, so we query vehicleId only.
  // plateNumber is resolved on the frontend from the vehicles list it already holds.
  async getFuelSummaryReport(
    companyId: number,
    query: ReportsQueryDto,
  ): Promise<FuelSummaryReport> {
    const qb = this.fuelRepo
      .createQueryBuilder('fl')
      .select('fl.vehicle_id', 'vehicleId')
      .addSelect('COALESCE(SUM(fl.total_cost), 0)',        'totalSpend')
      .addSelect('COALESCE(SUM(fl.litres), 0)',             'totalLitres')
      .addSelect('COALESCE(SUM(fl.km_since_last_fill), 0)', 'totalKm')
      .addSelect('AVG(fl.litres_per_100km)',                'avgLitresPer100km')
      .addSelect('AVG(fl.price_per_litre)',                 'avgPricePerLitre')
      .where('fl.company_id = :companyId', { companyId })
      .andWhere('fl.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .groupBy('fl.vehicle_id');

    if (query.vehicleId) {
      qb.andWhere('fl.vehicle_id = :vehicleId', { vehicleId: query.vehicleId });
    }

    const rows = await qb.getRawMany<{
      vehicleId: string;
      totalSpend: string;
      totalLitres: string;
      totalKm: string;
      avgLitresPer100km: string | null;
      avgPricePerLitre: string | null;
    }>();

    const totalFuelSpend    = rows.reduce((a, r) => a + parseFloat(r.totalSpend  || '0'), 0);
    const totalLitres       = rows.reduce((a, r) => a + parseFloat(r.totalLitres || '0'), 0);
    const totalKm           = rows.reduce((a, r) => a + parseFloat(r.totalKm     || '0'), 0);
    const avgLitresPer100km = totalKm > 0 ? parseFloat(((totalLitres / totalKm) * 100).toFixed(2)) : null;
    const avgPricePerLitre  = rows.length > 0
      ? parseFloat((rows.reduce((a, r) => a + parseFloat(r.avgPricePerLitre || '0'), 0) / rows.length).toFixed(2))
      : null;

    return {
      totalFuelSpend,
      totalLitres,
      avgPricePerLitre,
      avgLitresPer100km,
      perVehicle: rows.map((r) => ({
        vehicleId:         Number(r.vehicleId),
        plateNumber:       null, // resolved on frontend from vehicles list
        totalSpend:        parseFloat(r.totalSpend  || '0'),
        totalLitres:       parseFloat(r.totalLitres || '0'),
        totalKm:           parseFloat(r.totalKm     || '0'),
        avgLitresPer100km: r.avgLitresPer100km ? parseFloat(r.avgLitresPer100km) : null,
      })),
    };
  }

  // ── 3. CPK TREND (includes fuel cost per period) ──────────────────────────
  async getCpkTrend(companyId: number, query: ReportsQueryDto): Promise<CpkTrendPoint[]> {
    const granularity = (query as any).granularity ?? 'month';
    const bucket = granularity === 'week' ? 'week' : 'month';

    const expenseQb = this.finRepo
      .createQueryBuilder('ft')
      .select(`date_trunc('${bucket}', ft.date::timestamp)`, 'period')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
      .where('ft.companyId = :companyId', { companyId })
      .andWhere('ft.approvalStatus = :approved', { approved: ApprovalStatus.APPROVED })
      .andWhere('ft.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .groupBy('period')
      .orderBy('period', 'ASC');

    const fuelQb = this.fuelRepo
      .createQueryBuilder('fl')
      .select(`date_trunc('${bucket}', fl.date::timestamp)`, 'period')
      .addSelect('COALESCE(SUM(fl.total_cost), 0)', 'total')
      .where('fl.company_id = :companyId', { companyId })
      .andWhere('fl.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .groupBy('period')
      .orderBy('period', 'ASC');

    const distanceQb = this.mileageRepo
      .createQueryBuilder('ml')
      .select(`date_trunc('${bucket}', ml.date::timestamp)`, 'period')
      .addSelect('COALESCE(SUM(ml.distanceCovered), 0)', 'total')
      .where('ml.companyId = :companyId', { companyId })
      .andWhere('ml.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .andWhere('ml.distanceCovered IS NOT NULL')
      .groupBy('period')
      .orderBy('period', 'ASC');

    if (query.vehicleId) {
      expenseQb.andWhere('ft.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
      fuelQb.andWhere('fl.vehicle_id = :vehicleId', { vehicleId: query.vehicleId });
      distanceQb.andWhere('ml.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
    }

    const [expenseRows, fuelRows, distanceRows] = await Promise.all([
      expenseQb.getRawMany<{ period: Date | string; total: string }>(),
      fuelQb.getRawMany<{ period: Date | string; total: string }>(),
      distanceQb.getRawMany<{ period: Date | string; total: string }>(),
    ]);

    const toKey = (p: Date | string) =>
      (p instanceof Date ? p : new Date(p)).toISOString().slice(0, 10);

    const expenseByPeriod  = new Map(expenseRows.map((r) => [toKey(r.period), parseFloat(r.total)]));
    const fuelByPeriod     = new Map(fuelRows.map((r) => [toKey(r.period), parseFloat(r.total)]));
    const distanceByPeriod = new Map(distanceRows.map((r) => [toKey(r.period), parseFloat(r.total)]));

    const allPeriods = Array.from(
      new Set([...expenseByPeriod.keys(), ...fuelByPeriod.keys(), ...distanceByPeriod.keys()]),
    ).sort();

    return allPeriods.map((period) => {
      const totalApprovedExpenses = expenseByPeriod.get(period) ?? 0;
      const fuelCost              = fuelByPeriod.get(period) ?? 0;
      const totalCost             = totalApprovedExpenses + fuelCost;
      const totalDistanceCovered  = distanceByPeriod.get(period) ?? 0;
      return {
        period,
        totalApprovedExpenses,
        fuelCost,
        totalCost,
        totalDistanceCovered,
        costPerKilometer:
          totalDistanceCovered > 0
            ? parseFloat((totalCost / totalDistanceCovered).toFixed(4))
            : null,
      };
    });
  }

  // ── 4. ASSET UTILIZATION ──────────────────────────────────────────────────
  async getAssetUtilization(
    companyId: number,
    query: ReportsQueryDto,
  ): Promise<AssetUtilizationRow[]> {
    const qb = this.mileageRepo
      .createQueryBuilder('ml')
      .leftJoin('ml.vehicle', 'vehicle')
      .select('ml.vehicleId', 'vehicleId')
      .addSelect('vehicle.plateNumber', 'plateNumber')
      .addSelect('COALESCE(SUM(ml.distanceCovered), 0)', 'totalDistanceCovered')
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

  // ── 5. VEHICLE COMPARISON (fuel + non-fuel, no fl.vehicle join) ───────────
  async getVehicleComparison(
    companyId: number,
    query: ReportsQueryDto,
  ): Promise<VehicleComparisonRow[]> {
    const expenseQb = this.finRepo
      .createQueryBuilder('ft')
      .leftJoin('ft.vehicle', 'vehicle')
      .select('ft.vehicleId', 'vehicleId')
      .addSelect('vehicle.plateNumber', 'plateNumber')
      .addSelect('vehicle.model', 'model')
      .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
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

    // FuelLog has no vehicle relation — group by vehicleId only
    const fuelByVehicleQb = this.fuelRepo
      .createQueryBuilder('fl')
      .select('fl.vehicle_id', 'vehicleId')
      .addSelect('COALESCE(SUM(fl.total_cost), 0)', 'totalFuelCost')
      .where('fl.company_id = :companyId', { companyId })
      .andWhere('fl.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      })
      .groupBy('fl.vehicle_id');

    if (query.vehicleId) {
      expenseQb.andWhere('ft.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
      fuelByVehicleQb.andWhere('fl.vehicle_id = :vehicleId', { vehicleId: query.vehicleId });
    }

    const [expenseRows, fuelRows, utilizationRows] = await Promise.all([
      expenseQb.getRawMany<{ vehicleId: string; plateNumber: string | null; model: string | null; total: string }>(),
      fuelByVehicleQb.getRawMany<{ vehicleId: string; totalFuelCost: string }>(),
      this.getAssetUtilization(companyId, query),
    ]);

    const costByVehicle = new Map(
      expenseRows.map((r) => [Number(r.vehicleId), {
        total: parseFloat(r.total),
        plateNumber: r.plateNumber,
        model: r.model,
      }]),
    );

    const fuelCostByVehicle = new Map(
      fuelRows.map((r) => [Number(r.vehicleId), parseFloat(r.totalFuelCost)]),
    );

    const vehicleIds = new Set<number>([
      ...costByVehicle.keys(),
      ...fuelCostByVehicle.keys(),
      ...utilizationRows.map((r) => r.vehicleId),
    ]);

    return Array.from(vehicleIds).map((vid) => {
      const utilization      = utilizationRows.find((r) => r.vehicleId === vid);
      const costEntry        = costByVehicle.get(vid);
      const totalApprovedCost    = costEntry?.total ?? 0;
      const totalFuelCost        = fuelCostByVehicle.get(vid) ?? 0;
      const totalCost            = totalApprovedCost + totalFuelCost;
      const totalDistanceCovered = utilization?.totalDistanceCovered ?? 0;
      return {
        vehicleId: vid,
        plateNumber: costEntry?.plateNumber ?? utilization?.plateNumber ?? null,
        model: costEntry?.model ?? null,
        totalDistanceCovered,
        totalApprovedCost,
        totalFuelCost,
        totalCost,
        costPerKilometer:
          totalDistanceCovered > 0
            ? parseFloat((totalCost / totalDistanceCovered).toFixed(4))
            : null,
      };
    });
  }

  // ── COMBINED DASHBOARD ────────────────────────────────────────────────────
  async getDashboard(companyId: number, query: ReportsQueryDto): Promise<ReportsDashboard> {
    const [expenseBreakdown, fuelSummary, cpkTrend, vehicleComparison] = await Promise.all([
      this.getExpenseBreakdown(companyId, query),
      this.getFuelSummaryReport(companyId, query),
      this.getCpkTrend(companyId, query),
      this.getVehicleComparison(companyId, query),
    ]);

    const cumulativeCompanySpend = expenseBreakdown
      .filter((r) => r.category !== 'fuel')
      .reduce((s, r) => s + r.total, 0);

    const totalFuelSpend      = fuelSummary.totalFuelSpend;
    const totalCombinedSpend  = cumulativeCompanySpend + totalFuelSpend;
    const totalDistanceLogged = vehicleComparison.reduce((s, r) => s + r.totalDistanceCovered, 0);
    const averageFleetEfficiency =
      totalDistanceLogged > 0
        ? parseFloat((totalCombinedSpend / totalDistanceLogged).toFixed(4))
        : null;

    return {
      kpis: {
        cumulativeCompanySpend,
        totalFuelSpend,
        totalCombinedSpend,
        totalDistanceLogged,
        averageFleetEfficiency,
        avgFuelPricePerLitre: fuelSummary.avgPricePerLitre,
        avgLitresPer100km: fuelSummary.avgLitresPer100km,
      },
      expenseBreakdown,
      fuelSummary,
      cpkTrend,
      vehicleComparison,
    };
  }
}
