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
exports.FuelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fuel_log_entity_1 = require("./entities/fuel-log.entity");
const mileage_log_entity_1 = require("../financials/entities/mileage-log.entity");
const fuel_request_entity_1 = require("./entities/fuel-request.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
let FuelService = class FuelService {
    fuelRepo;
    mileageRepo;
    fuelRequestRepo;
    driverRepo;
    constructor(fuelRepo, mileageRepo, fuelRequestRepo, driverRepo) {
        this.fuelRepo = fuelRepo;
        this.mileageRepo = mileageRepo;
        this.fuelRequestRepo = fuelRequestRepo;
        this.driverRepo = driverRepo;
    }
    async getAssignedVehicleForDriver(driverId, companyId) {
        if (!driverId) {
            throw new common_1.NotFoundException('No driverId provided — cannot resolve assigned vehicle.');
        }
        const driver = await this.driverRepo.findOne({
            where: { id: driverId, company: { id: companyId } },
            relations: { assignedVehicle: true },
        });
        if (!driver) {
            throw new common_1.NotFoundException(`Driver #${driverId} not found for this company.`);
        }
        if (!driver.assignedVehicle) {
            throw new common_1.NotFoundException('No active vehicle asset mapped to this driver account.');
        }
        return driver.assignedVehicle;
    }
    async createFuelRequest(driverId, companyId, data, receiptImagePath) {
        if (!driverId || !companyId) {
            throw new common_1.ForbiddenException('Missing driver or company context for this request.');
        }
        if (!data || data.vehicleId === undefined || data.vehicleId === null) {
            throw new common_1.ForbiddenException('Missing vehicleId in fuel request payload.');
        }
        const vehicle = await this.getAssignedVehicleForDriver(driverId, companyId);
        if (Number(vehicle.id) !== Number(data.vehicleId)) {
            throw new common_1.ForbiddenException('Unauthorized: You can only submit fuel logs for your assigned vehicle.');
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
            status: fuel_request_entity_1.FuelRequestStatus.PENDING,
        });
        return await this.fuelRequestRepo.save(request);
    }
    async createFuelLog(dto, companyId) {
        const totalCost = Number(dto.litres) * Number(dto.pricePerLitre);
        const previous = await this.fuelRepo.findOne({
            where: { vehicleId: dto.vehicleId, companyId },
            order: { createdAt: 'DESC' },
        });
        const kmSinceLastFill = previous
            ? Math.max(0, dto.odometerReading - Number(previous.odometerReading))
            : 0;
        const litresPer100km = kmSinceLastFill > 0
            ? parseFloat(((Number(dto.litres) / kmSinceLastFill) * 100).toFixed(2))
            : undefined;
        const log = this.fuelRepo.create({
            vehicleId: dto.vehicleId,
            driverId: dto.driverId,
            date: dto.date,
            litres: dto.litres,
            pricePerLitre: dto.pricePerLitre,
            odometerReading: dto.odometerReading,
            notes: dto.notes,
            companyId,
            totalCost: parseFloat(totalCost.toFixed(2)),
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
                vehicleId: dto.vehicleId,
                companyId,
                date: dto.date,
                odometerReading: dto.odometerReading,
                distanceCovered,
            });
            await this.mileageRepo.save(mileageLog);
        }
        return saved;
    }
    async getFuelLogs(companyId, vehicleId) {
        const qb = this.fuelRepo
            .createQueryBuilder('fl')
            .where('fl.company_id = :companyId', { companyId })
            .orderBy('fl.created_at', 'DESC');
        if (vehicleId) {
            qb.andWhere('fl.vehicle_id = :vehicleId', { vehicleId });
        }
        return qb.getMany();
    }
    async getFuelSummary(companyId) {
        const rows = await this.fuelRepo
            .createQueryBuilder('fl')
            .select('fl.vehicle_id', 'vehicleId')
            .addSelect('SUM(fl.total_cost)', 'totalSpend')
            .addSelect('SUM(fl.litres)', 'totalLitres')
            .addSelect('SUM(fl.km_since_last_fill)', 'totalKm')
            .addSelect('AVG(fl.litres_per_100km)', 'avgLitresPer100km')
            .addSelect('AVG(fl.price_per_litre)', 'avgPricePerLitre')
            .where('fl.company_id = :companyId', { companyId })
            .groupBy('fl.vehicle_id')
            .getRawMany();
        const totalSpend = rows.reduce((a, r) => a + parseFloat(r.totalSpend || 0), 0);
        const totalLitres = rows.reduce((a, r) => a + parseFloat(r.totalLitres || 0), 0);
        const totalKm = rows.reduce((a, r) => a + parseFloat(r.totalKm || 0), 0);
        const avgLitresPer100km = totalKm > 0 ? parseFloat(((totalLitres / totalKm) * 100).toFixed(2)) : null;
        const avgPricePerLitre = rows.length > 0
            ? parseFloat((rows.reduce((a, r) => a + parseFloat(r.avgPricePerLitre || 0), 0) / rows.length).toFixed(2))
            : null;
        return {
            totalSpend,
            totalLitres,
            totalKm,
            avgLitresPer100km,
            avgPricePerLitre,
            perVehicle: rows.map((r) => ({
                vehicleId: Number(r.vehicleId),
                totalSpend: parseFloat(r.totalSpend || 0),
                totalLitres: parseFloat(r.totalLitres || 0),
                totalKm: parseFloat(r.totalKm || 0),
                avgLitresPer100km: r.avgLitresPer100km ? parseFloat(r.avgLitresPer100km) : null,
            })),
        };
    }
};
exports.FuelService = FuelService;
exports.FuelService = FuelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fuel_log_entity_1.FuelLog)),
    __param(1, (0, typeorm_1.InjectRepository)(mileage_log_entity_1.MileageLog)),
    __param(2, (0, typeorm_1.InjectRepository)(fuel_request_entity_1.FuelRequest)),
    __param(3, (0, typeorm_1.InjectRepository)(driver_entity_1.Driver)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FuelService);
//# sourceMappingURL=fuel.service.js.map