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
exports.GeofenceController = void 0;
const common_1 = require("@nestjs/common");
const geofence_service_1 = require("./geofence.service");
const upsert_geofence_dto_1 = require("./dto/upsert-geofence.dto");
let GeofenceController = class GeofenceController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    getForCompany(req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.getForCompany(companyId);
    }
    getForVehicle(vehicleId, req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.getForVehicle(vehicleId, companyId);
    }
    upsertForVehicle(vehicleId, dto, req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.upsertForVehicle(vehicleId, companyId, dto);
    }
    deleteForVehicle(vehicleId, req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.deleteForVehicle(vehicleId, companyId);
    }
};
exports.GeofenceController = GeofenceController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GeofenceController.prototype, "getForCompany", null);
__decorate([
    (0, common_1.Get)(':vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", void 0)
], GeofenceController.prototype, "getForVehicle", null);
__decorate([
    (0, common_1.Put)(':vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, upsert_geofence_dto_1.UpsertGeofenceDto, Object, String]),
    __metadata("design:returntype", void 0)
], GeofenceController.prototype, "upsertForVehicle", null);
__decorate([
    (0, common_1.Delete)(':vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", void 0)
], GeofenceController.prototype, "deleteForVehicle", null);
exports.GeofenceController = GeofenceController = __decorate([
    (0, common_1.Controller)('geofence'),
    __metadata("design:paramtypes", [geofence_service_1.GeofenceService])
], GeofenceController);
//# sourceMappingURL=geofence.controller.js.map