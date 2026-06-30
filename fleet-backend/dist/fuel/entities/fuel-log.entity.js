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
exports.FuelLog = void 0;
const typeorm_1 = require("typeorm");
let FuelLog = class FuelLog {
    id;
    companyId;
    vehicleId;
    driverId;
    date;
    litres;
    pricePerLitre;
    totalCost;
    odometerReading;
    kmSinceLastFill;
    litresPer100km;
    notes;
    createdAt;
    updatedAt;
};
exports.FuelLog = FuelLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FuelLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", Number)
], FuelLog.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id' }),
    __metadata("design:type", Number)
], FuelLog.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_id', nullable: true }),
    __metadata("design:type", Number)
], FuelLog.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], FuelLog.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'litres', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], FuelLog.prototype, "litres", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_per_litre', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], FuelLog.prototype, "pricePerLitre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], FuelLog.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'odometer_reading', type: 'decimal', precision: 10, scale: 1 }),
    __metadata("design:type", Number)
], FuelLog.prototype, "odometerReading", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'km_since_last_fill', type: 'decimal', precision: 10, scale: 1, default: 0 }),
    __metadata("design:type", Number)
], FuelLog.prototype, "kmSinceLastFill", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'litres_per_100km', type: 'decimal', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], FuelLog.prototype, "litresPer100km", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', nullable: true }),
    __metadata("design:type", String)
], FuelLog.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FuelLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FuelLog.prototype, "updatedAt", void 0);
exports.FuelLog = FuelLog = __decorate([
    (0, typeorm_1.Entity)('fuel_logs')
], FuelLog);
//# sourceMappingURL=fuel-log.entity.js.map