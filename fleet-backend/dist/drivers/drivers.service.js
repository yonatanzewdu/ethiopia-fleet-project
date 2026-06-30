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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("./entities/driver.entity");
const company_entity_1 = require("../companies/entities/company.entity");
const vehicle_entity_1 = require("../vehicles/entities/vehicle.entity");
let DriversService = class DriversService {
    driverRepository;
    companyRepository;
    vehicleRepository;
    constructor(driverRepository, companyRepository, vehicleRepository) {
        this.driverRepository = driverRepository;
        this.companyRepository = companyRepository;
        this.vehicleRepository = vehicleRepository;
    }
    async create(dto) {
        const company = await this.companyRepository.findOne({
            where: { id: dto.companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company #${dto.companyId} not found`);
        }
        const existing = await this.driverRepository.findOne({
            where: { licenseNumber: dto.licenseNumber },
        });
        if (existing) {
            throw new common_1.BadRequestException('A driver with this license number already exists.');
        }
        let assignedVehicle = undefined;
        if (dto.assignedVehicleId) {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id: dto.assignedVehicleId },
                relations: { assignedDriver: true },
            });
            if (!vehicle) {
                throw new common_1.NotFoundException(`Vehicle #${dto.assignedVehicleId} not found`);
            }
            if (vehicle.assignedDriver) {
                throw new common_1.BadRequestException(`Vehicle #${dto.assignedVehicleId} is already assigned to another driver`);
            }
            assignedVehicle = vehicle;
        }
        const driver = this.driverRepository.create({
            fullName: dto.fullName,
            licenseNumber: dto.licenseNumber,
            licenseExpiry: dto.licenseExpiry,
            phoneNumber: dto.phoneNumber,
            isActive: dto.isActive ?? true,
            company,
            ...(assignedVehicle ? { assignedVehicle } : {}),
        });
        return this.driverRepository.save(driver);
    }
    async findAll(companyId) {
        const where = companyId ? { company: { id: companyId } } : {};
        return this.driverRepository.find({
            where,
            relations: { company: true, assignedVehicle: true },
        });
    }
    async findOne(id) {
        const driver = await this.driverRepository.findOne({
            where: { id },
            relations: { company: true, assignedVehicle: true },
        });
        if (!driver) {
            throw new common_1.NotFoundException(`Driver #${id} not found`);
        }
        return driver;
    }
    async update(id, dto) {
        const driver = await this.findOne(id);
        if (dto.assignedVehicleId !== undefined) {
            if (dto.assignedVehicleId === null) {
                driver.assignedVehicle = undefined;
            }
            else {
                const vehicle = await this.vehicleRepository.findOne({
                    where: { id: dto.assignedVehicleId },
                    relations: { assignedDriver: true },
                });
                if (!vehicle) {
                    throw new common_1.NotFoundException(`Vehicle #${dto.assignedVehicleId} not found`);
                }
                if (vehicle.assignedDriver && vehicle.assignedDriver.id !== id) {
                    throw new common_1.BadRequestException(`Vehicle #${dto.assignedVehicleId} is already assigned to another driver`);
                }
                driver.assignedVehicle = vehicle;
            }
        }
        const { assignedVehicleId: _, companyId: __, ...rest } = dto;
        Object.assign(driver, rest);
        return this.driverRepository.save(driver);
    }
    async remove(id) {
        const driver = await this.findOne(id);
        await this.driverRepository.remove(driver);
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.Driver)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(2, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DriversService);
//# sourceMappingURL=drivers.service.js.map