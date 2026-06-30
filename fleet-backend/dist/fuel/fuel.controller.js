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
exports.FuelController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fuel_service_1 = require("./fuel.service");
const fuel_dto_1 = require("./dto/fuel.dto");
let FuelController = class FuelController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async getDriverVehicle(req, driverIdQuery, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        const driverId = req.user?.id ?? Number(driverIdQuery);
        return this.svc.getAssignedVehicleForDriver(driverId, companyId);
    }
    async driverSubmitFuelLog(body, file, req, driverIdQuery, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        const driverId = req.user?.id ?? Number(driverIdQuery);
        if (!body) {
            throw new common_1.BadRequestException('Request body missing — could not parse submission.');
        }
        const receiptImagePath = file ? `/uploads/receipts/${file.filename}` : undefined;
        return this.svc.createFuelRequest(driverId, companyId, body, receiptImagePath);
    }
    create(dto, req) {
        const companyId = req.user?.companyId ?? dto.companyId;
        return this.svc.createFuelLog(dto, companyId);
    }
    findAll(req, companyIdQuery, vehicleIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        const vehicleId = vehicleIdQuery ? Number(vehicleIdQuery) : undefined;
        return this.svc.getFuelLogs(companyId, vehicleId);
    }
    summary(req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.getFuelSummary(companyId);
    }
};
exports.FuelController = FuelController;
__decorate([
    (0, common_1.Get)('driver/vehicle'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('driverId')),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FuelController.prototype, "getDriverVehicle", null);
__decorate([
    (0, common_1.Post)('driver/submit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('receiptImage', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/receipts',
            filename: (req, file, cb) => {
                const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: { fileSize: 8 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Receipt must be an image file.'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Query)('driverId')),
    __param(4, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], FuelController.prototype, "driverSubmitFuelLog", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fuel_dto_1.CreateFuelLogDto, Object]),
    __metadata("design:returntype", void 0)
], FuelController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], FuelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FuelController.prototype, "summary", null);
exports.FuelController = FuelController = __decorate([
    (0, common_1.Controller)('fuel'),
    __metadata("design:paramtypes", [fuel_service_1.FuelService])
], FuelController);
//# sourceMappingURL=fuel.controller.js.map