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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vehicle_entity_1 = require("./entities/vehicle.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const company_entity_1 = require("../companies/entities/company.entity");
let VehiclesService = class VehiclesService {
    vehicleRepository;
    driverRepository;
    companyRepository;
    constructor(vehicleRepository, driverRepository, companyRepository) {
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.companyRepository = companyRepository;
    }
    async create(dto) {
        const company = await this.companyRepository.findOne({
            where: { id: dto.companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company #${dto.companyId} not found`);
        }
        const existing = await this.vehicleRepository.findOne({
            where: { plateNumber: dto.plateNumber },
        });
        if (existing) {
            throw new common_1.BadRequestException('A vehicle with this plate number already exists.');
        }
        const vehicle = this.vehicleRepository.create({ ...dto, company });
        return this.vehicleRepository.save(vehicle);
    }
    async findAll(companyId) {
        const where = companyId ? { company: { id: companyId } } : {};
        return this.vehicleRepository.find({
            where,
            relations: { company: true, assignedDriver: true },
        });
    }
    async findOne(id) {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id },
            relations: { company: true, assignedDriver: true },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle #${id} not found`);
        }
        return vehicle;
    }
    async update(id, dto) {
        const vehicle = await this.findOne(id);
        Object.assign(vehicle, dto);
        return this.vehicleRepository.save(vehicle);
    }
    async remove(id) {
        const vehicle = await this.findOne(id);
        await this.vehicleRepository.remove(vehicle);
    }
    async assignDriver(vehicleId, driverId) {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id: vehicleId },
            relations: { company: true, assignedDriver: true },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle #${vehicleId} not found`);
        }
        const driver = await this.driverRepository.findOne({
            where: { id: driverId },
            relations: { company: true },
        });
        if (!driver) {
            throw new common_1.NotFoundException(`Driver #${driverId} not found`);
        }
        if (vehicle.company.id !== driver.company.id) {
            throw new common_1.BadRequestException('Vehicle and driver do not belong to the same company.');
        }
        vehicle.assignedDriver = driver;
        return this.vehicleRepository.save(vehicle);
    }
    async releaseDriver(vehicleId) {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id: vehicleId },
            relations: { company: true, assignedDriver: true },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle #${vehicleId} not found`);
        }
        if (!vehicle.assignedDriver) {
            throw new common_1.BadRequestException(`Vehicle #${vehicleId} has no assigned driver to release.`);
        }
        vehicle.assignedDriver = null;
        return this.vehicleRepository.save(vehicle);
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(1, (0, typeorm_1.InjectRepository)(driver_entity_1.Driver)),
    __param(2, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map