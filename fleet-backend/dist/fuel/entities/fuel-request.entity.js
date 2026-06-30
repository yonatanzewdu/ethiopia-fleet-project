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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuelRequest = exports.FuelRequestStatus = void 0;
const typeorm_1 = require("typeorm");
var FuelRequestStatus;
(function (FuelRequestStatus) {
    FuelRequestStatus["PENDING"] = "PENDING";
    FuelRequestStatus["APPROVED"] = "APPROVED";
    FuelRequestStatus["REJECTED"] = "REJECTED";
})(FuelRequestStatus || (exports.FuelRequestStatus = FuelRequestStatus = {}));
let FuelRequest = class FuelRequest {
    id;
    amountEtb;
    litresFilled;
    pricePerLitre;
    odometerReading;
    receiptImage;
    status;
    date;
    companyId;
    vehicleId;
    driverId;
};
exports.FuelRequest = FuelRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FuelRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], FuelRequest.prototype, "amountEtb", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], FuelRequest.prototype, "litresFilled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], FuelRequest.prototype, "pricePerLitre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 1 }),
    __metadata("design:type", Number)
], FuelRequest.prototype, "odometerReading", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FuelRequest.prototype, "receiptImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: FuelRequestStatus, default: FuelRequestStatus.PENDING }),
    __metadata("design:type", String)
], FuelRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], FuelRequest.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", Number)
], FuelRequest.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id' }),
    __metadata("design:type", Number)
], FuelRequest.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_id' }),
    __metadata("design:type", Number)
], FuelRequest.prototype, "driverId", void 0);
exports.FuelRequest = FuelRequest = __decorate([
    (0, typeorm_1.Entity)('fuel_requests'),
    (0, typeorm_1.Index)(['companyId'])
], FuelRequest);
//# sourceMappingURL=fuel-request.entity.js.map