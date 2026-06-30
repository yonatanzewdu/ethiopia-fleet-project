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
exports.GeofenceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const geofence_entity_1 = require("./entities/geofence.entity");
const DEFAULT_RADIUS = 2000;
let GeofenceService = class GeofenceService {
    geofenceRepo;
    constructor(geofenceRepo) {
        this.geofenceRepo = geofenceRepo;
    }
    async getForCompany(companyId) {
        return this.geofenceRepo.find({ where: { companyId } });
    }
    async getForVehicle(vehicleId, companyId) {
        const geofence = await this.geofenceRepo.findOne({ where: { vehicleId } });
        if (geofence && geofence.companyId !== companyId) {
            throw new common_1.ForbiddenException('Access denied — cross-tenant operation.');
        }
        return geofence ?? null;
    }
    async upsertForVehicle(vehicleId, companyId, dto) {
        const existing = await this.geofenceRepo.findOne({ where: { vehicleId } });
        if (existing) {
            if (existing.companyId !== companyId) {
                throw new common_1.ForbiddenException('Access denied — cross-tenant operation.');
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
    async deleteForVehicle(vehicleId, companyId) {
        const existing = await this.geofenceRepo.findOne({ where: { vehicleId } });
        if (!existing)
            throw new common_1.NotFoundException(`No geofence set for vehicle #${vehicleId}.`);
        if (existing.companyId !== companyId) {
            throw new common_1.ForbiddenException('Access denied — cross-tenant operation.');
        }
        await this.geofenceRepo.remove(existing);
    }
};
exports.GeofenceService = GeofenceService;
exports.GeofenceService = GeofenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(geofence_entity_1.Geofence)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GeofenceService);
//# sourceMappingURL=geofence.service.js.map