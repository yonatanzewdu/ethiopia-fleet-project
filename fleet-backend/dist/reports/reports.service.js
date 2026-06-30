"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const financial_transaction_entity_1 = require("../financials/entities/financial-transaction.entity");
const mileage_log_entity_1 = require("../financials/entities/mileage-log.entity");
let ReportsService = class ReportsService {
    finRepo;
    mileageRepo;
    constructor(finRepo, mileageRepo) {
        this.finRepo = finRepo;
        this.mileageRepo = mileageRepo;
    }
    async getExpenseBreakdown(companyId, query) {
        const qb = this.finRepo
            .createQueryBuilder('ft')
            .select('ft.category', 'category')
            .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
            .where('ft.companyId = :companyId', { companyId })
            .andWhere('ft.approvalStatus = :approved', { approved: financial_transaction_entity_1.ApprovalStatus.APPROVED })
            .andWhere('ft.date BETWEEN :startDate AND :endDate', {
            startDate: query.startDate,
            endDate: query.endDate,
        })
            .groupBy('ft.category');
        if (query.vehicleId) {
            qb.andWhere('ft.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
        }
        const rows = await qb.getRawMany();
        return rows.map((r) => ({ category: r.category, total: parseFloat(r.total) }));
    }
    async getCpkTrend(companyId, query) {
        const granularity = query.granularity ?? 'month';
        const bucket = granularity === 'week' ? 'week' : 'month';
        const expenseQb = this.finRepo
            .createQueryBuilder('ft')
            .select(`date_trunc('${bucket}', ft.date::timestamp)`, 'period')
            .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
            .where('ft.companyId = :companyId', { companyId })
            .andWhere('ft.approvalStatus = :approved', { approved: financial_transaction_entity_1.ApprovalStatus.APPROVED })
            .andWhere('ft.date BETWEEN :startDate AND :endDate', {
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
            distanceQb.andWhere('ml.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
        }
        const [expenseRows, distanceRows] = await Promise.all([
            expenseQb.getRawMany(),
            distanceQb.getRawMany(),
        ]);
        const toKey = (p) => (p instanceof Date ? p : new Date(p)).toISOString().slice(0, 10);
        const expenseByPeriod = new Map(expenseRows.map((r) => [toKey(r.period), parseFloat(r.total)]));
        const distanceByPeriod = new Map(distanceRows.map((r) => [toKey(r.period), parseFloat(r.total)]));
        const allPeriods = Array.from(new Set([...expenseByPeriod.keys(), ...distanceByPeriod.keys()])).sort();
        return allPeriods.map((period) => {
            const totalApprovedExpenses = expenseByPeriod.get(period) ?? 0;
            const totalDistanceCovered = distanceByPeriod.get(period) ?? 0;
            return {
                period,
                totalApprovedExpenses,
                totalDistanceCovered,
                costPerKilometer: totalDistanceCovered > 0
                    ? parseFloat((totalApprovedExpenses / totalDistanceCovered).toFixed(4))
                    : null,
            };
        });
    }
    async getAssetUtilization(companyId, query) {
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
        const rows = await qb.getRawMany();
        return rows.map((r) => ({
            vehicleId: Number(r.vehicleId),
            plateNumber: r.plateNumber,
            totalDistanceCovered: parseFloat(r.totalDistanceCovered),
        }));
    }
    async getVehicleComparison(companyId, query) {
        const expenseQb = this.finRepo
            .createQueryBuilder('ft')
            .leftJoin('ft.vehicle', 'vehicle')
            .select('ft.vehicleId', 'vehicleId')
            .addSelect('vehicle.plateNumber', 'plateNumber')
            .addSelect('vehicle.model', 'model')
            .addSelect('COALESCE(SUM(ft.amount), 0)', 'total')
            .where('ft.companyId = :companyId', { companyId })
            .andWhere('ft.approvalStatus = :approved', { approved: financial_transaction_entity_1.ApprovalStatus.APPROVED })
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
            expenseQb.getRawMany(),
            this.getAssetUtilization(companyId, query),
        ]);
        const costByVehicle = new Map(expenseRows.map((r) => [Number(r.vehicleId), {
                total: parseFloat(r.total),
                plateNumber: r.plateNumber,
                model: r.model,
            }]));
        const vehicleIds = new Set([
            ...costByVehicle.keys(),
            ...utilizationRows.map((r) => r.vehicleId),
        ]);
        return Array.from(vehicleIds).map((vid) => {
            const utilization = utilizationRows.find((r) => r.vehicleId === vid);
            const costEntry = costByVehicle.get(vid);
            const totalApprovedCost = costEntry?.total ?? 0;
            const totalDistanceCovered = utilization?.totalDistanceCovered ?? 0;
            return {
                vehicleId: vid,
                plateNumber: costEntry?.plateNumber ?? utilization?.plateNumber ?? null,
                model: costEntry?.model ?? null,
                totalDistanceCovered,
                totalApprovedCost,
                costPerKilometer: totalDistanceCovered > 0
                    ? parseFloat((totalApprovedCost / totalDistanceCovered).toFixed(4))
                    : null,
            };
        });
    }
    async getDashboard(companyId, query) {
        const [expenseBreakdown, cpkTrend, vehicleComparison] = await Promise.all([
            this.getExpenseBreakdown(companyId, query),
            this.getCpkTrend(companyId, query),
            this.getVehicleComparison(companyId, query),
        ]);
        const cumulativeCompanySpend = expenseBreakdown.reduce((s, r) => s + r.total, 0);
        const totalDistanceLogged = vehicleComparison.reduce((s, r) => s + r.totalDistanceCovered, 0);
        const averageFleetEfficiency = totalDistanceLogged > 0
            ? parseFloat((cumulativeCompanySpend / totalDistanceLogged).toFixed(4))
            : null;
        return {
            kpis: { cumulativeCompanySpend, totalDistanceLogged, averageFleetEfficiency },
            expenseBreakdown,
            cpkTrend,
            vehicleComparison,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(financial_transaction_entity_1.FinancialTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(mileage_log_entity_1.MileageLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map