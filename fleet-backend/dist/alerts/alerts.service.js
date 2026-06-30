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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const company_entity_1 = require("../companies/entities/company.entity");
const THRESHOLDS = {
    DRIVER_LICENSE: { warning: 60, critical: 30 },
    VEHICLE_INSPECTION: { warning: 60, critical: 30 },
    VEHICLE_INSURANCE: { warning: 30, critical: 7 },
};
let AlertsService = class AlertsService {
    vehicleRepository;
    driverRepository;
    companyRepository;
    constructor(vehicleRepository, driverRepository, companyRepository) {
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.companyRepository = companyRepository;
    }
    async getCompanyAlerts(companyId) {
        const company = await this.companyRepository.findOne({
            where: { id: companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company #${companyId} not found`);
        }
        const [vehicles, drivers] = await Promise.all([
            this.vehicleRepository.find({
                where: { company: { id: companyId } },
            }),
            this.driverRepository.find({
                where: { company: { id: companyId } },
            }),
        ]);
        const today = this.toDateOnly(new Date());
        const alerts = [];
        for (const vehicle of vehicles) {
            this.evaluate(alerts, vehicle.insuranceExpiry, today, 'VEHICLE_INSURANCE', vehicle.id, vehicle.plateNumber);
            this.evaluate(alerts, vehicle.inspectionExpiry, today, 'VEHICLE_INSPECTION', vehicle.id, vehicle.plateNumber);
        }
        for (const driver of drivers) {
            this.evaluate(alerts, driver.licenseExpiry, today, 'DRIVER_LICENSE', driver.id, driver.fullName);
        }
        alerts.sort((a, b) => {
            if (a.severity !== b.severity) {
                return a.severity === 'CRITICAL' ? -1 : 1;
            }
            return a.daysRemaining - b.daysRemaining;
        });
        return {
            companyId,
            criticalCount: alerts.filter((a) => a.severity === 'CRITICAL').length,
            warningCount: alerts.filter((a) => a.severity === 'WARNING').length,
            totalCount: alerts.length,
            alerts,
        };
    }
    evaluate(alerts, expiryDate, today, category, assetId, assetName) {
        const daysRemaining = this.daysUntil(expiryDate, today);
        const threshold = THRESHOLDS[category];
        let severity = null;
        if (daysRemaining <= threshold.critical) {
            severity = 'CRITICAL';
        }
        else if (daysRemaining <= threshold.warning) {
            severity = 'WARNING';
        }
        if (severity !== null) {
            alerts.push({ severity, category, assetId, assetName, expiryDate, daysRemaining });
        }
    }
    daysUntil(expiryDate, today) {
        const expiry = new Date(expiryDate);
        const msPerDay = 1000 * 60 * 60 * 24;
        return Math.floor((expiry.getTime() - today.getTime()) / msPerDay);
    }
    toDateOnly(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(1, (0, typeorm_1.InjectRepository)(driver_entity_1.Driver)),
    __param(2, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map