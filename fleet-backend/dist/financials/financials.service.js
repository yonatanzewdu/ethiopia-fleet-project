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
exports.FinancialsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const financial_transaction_entity_1 = require("./entities/financial-transaction.entity");
const mileage_log_entity_1 = require("./entities/mileage-log.entity");
const fuel_log_entity_1 = require("../fuel/entities/fuel-log.entity");
let FinancialsService = class FinancialsService {
    txRepo;
    mileageRepo;
    fuelRepo;
    constructor(txRepo, mileageRepo, fuelRepo) {
        this.txRepo = txRepo;
        this.mileageRepo = mileageRepo;
        this.fuelRepo = fuelRepo;
    }
    async createManagerTransaction(dto, companyId) {
        const tx = this.txRepo.create({
            amount: dto.amount,
            category: dto.category,
            description: dto.description,
            receiptUrl: dto.receiptUrl,
            date: dto.date,
            vehicleId: dto.vehicleId ? Number(dto.vehicleId) : undefined,
            driverId: dto.driverId ? Number(dto.driverId) : undefined,
            companyId,
            approvalStatus: financial_transaction_entity_1.ApprovalStatus.APPROVED,
        });
        return this.txRepo.save(tx);
    }
    async createDriverReceipt(dto, companyId, driverId) {
        const tx = this.txRepo.create({
            ...dto,
            companyId,
            driverId,
            approvalStatus: financial_transaction_entity_1.ApprovalStatus.PENDING,
        });
        return this.txRepo.save(tx);
    }
    async getTransactionsByCompany(companyId, status) {
        const qb = this.txRepo
            .createQueryBuilder('tx')
            .where('tx.company_id = :companyId', { companyId })
            .orderBy('tx.created_at', 'DESC');
        if (status) {
            qb.andWhere('tx.approval_status = :status', { status });
        }
        return qb.getMany();
    }
    async updateApprovalStatus(id, dto, companyId) {
        const tx = await this.txRepo.findOne({ where: { id } });
        if (!tx)
            throw new common_1.NotFoundException(`Transaction #${id} not found.`);
        if (tx.companyId !== companyId) {
            throw new common_1.ForbiddenException('Access denied — cross-tenant operation.');
        }
        tx.approvalStatus = dto.approvalStatus;
        return this.txRepo.save(tx);
    }
    async createMileageLog(dto, companyId) {
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
    async getMileageLogs(companyId, vehicleId) {
        const qb = this.mileageRepo
            .createQueryBuilder('ml')
            .where('ml.company_id = :companyId', { companyId })
            .orderBy('ml.created_at', 'DESC');
        if (vehicleId) {
            qb.andWhere('ml.vehicle_id = :vehicleId', { vehicleId });
        }
        return qb.getMany();
    }
    async getCostPerKilometre(companyId) {
        const expenseRows = await this.txRepo
            .createQueryBuilder('tx')
            .select('tx.vehicle_id', 'vehicleId')
            .addSelect('SUM(tx.amount)', 'totalExpenses')
            .where('tx.company_id = :companyId', { companyId })
            .andWhere('tx.approval_status = :approved', { approved: financial_transaction_entity_1.ApprovalStatus.APPROVED })
            .andWhere("tx.category::text != 'FUEL'")
            .groupBy('tx.vehicle_id')
            .getRawMany();
        const fuelRows = await this.fuelRepo
            .createQueryBuilder('fl')
            .select('fl.vehicle_id', 'vehicleId')
            .addSelect('SUM(fl.total_cost)', 'totalFuel')
            .where('fl.company_id = :companyId', { companyId })
            .groupBy('fl.vehicle_id')
            .getRawMany();
        const distanceRows = await this.mileageRepo
            .createQueryBuilder('ml')
            .select('ml.vehicle_id', 'vehicleId')
            .addSelect('SUM(ml.distance_covered)', 'totalDistance')
            .where('ml.company_id = :companyId', { companyId })
            .groupBy('ml.vehicle_id')
            .getRawMany();
        const vehicleIds = new Set([
            ...expenseRows.map((r) => Number(r.vehicleId)),
            ...fuelRows.map((r) => Number(r.vehicleId)),
            ...distanceRows.map((r) => Number(r.vehicleId)),
        ]);
        const expenseMap = new Map(expenseRows.map((r) => [Number(r.vehicleId), parseFloat(r.totalExpenses)]));
        const fuelMap = new Map(fuelRows.map((r) => [Number(r.vehicleId), parseFloat(r.totalFuel)]));
        const distanceMap = new Map(distanceRows.map((r) => [Number(r.vehicleId), parseFloat(r.totalDistance)]));
        return Array.from(vehicleIds).map((vehicleId) => {
            const totalApprovedExpenses = expenseMap.get(vehicleId) ?? 0;
            const totalFuelCost = fuelMap.get(vehicleId) ?? 0;
            const totalDistanceKm = distanceMap.get(vehicleId) ?? 0;
            const totalCost = totalApprovedExpenses + totalFuelCost;
            const cpk = totalDistanceKm > 0
                ? parseFloat((totalCost / totalDistanceKm).toFixed(4))
                : null;
            return { vehicleId, totalApprovedExpenses, totalFuelCost, totalDistanceKm, cpk };
        });
    }
    async getFleetSummary(companyId) {
        const txRows = await this.txRepo
            .createQueryBuilder('tx')
            .select('tx.category', 'category')
            .addSelect('SUM(tx.amount)', 'total')
            .where('tx.company_id = :companyId', { companyId })
            .andWhere('tx.approval_status = :approved', { approved: financial_transaction_entity_1.ApprovalStatus.APPROVED })
            .groupBy('tx.category')
            .getRawMany();
        const fuelTotalRow = await this.fuelRepo
            .createQueryBuilder('fl')
            .select('SUM(fl.total_cost)', 'total')
            .where('fl.company_id = :companyId', { companyId })
            .getRawOne();
        const fuelTotal = parseFloat(fuelTotalRow?.total || '0');
        if (fuelTotal > 0) {
            const existingFuel = txRows.find((r) => r.category === 'FUEL');
            if (existingFuel) {
                existingFuel.total = String(parseFloat(existingFuel.total) + fuelTotal);
            }
            else {
                txRows.push({ category: 'FUEL', total: String(fuelTotal) });
            }
        }
        return txRows;
    }
};
exports.FinancialsService = FinancialsService;
exports.FinancialsService = FinancialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(financial_transaction_entity_1.FinancialTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(mileage_log_entity_1.MileageLog)),
    __param(2, (0, typeorm_1.InjectRepository)(fuel_log_entity_1.FuelLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FinancialsService);
//# sourceMappingURL=financials.service.js.map