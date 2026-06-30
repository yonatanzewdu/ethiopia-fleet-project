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
exports.MileageLog = void 0;
const typeorm_1 = require("typeorm");
const vehicle_entity_1 = require("../../vehicles/entities/vehicle.entity");
const company_entity_1 = require("../../companies/entities/company.entity");
let MileageLog = class MileageLog {
    id;
    date;
    odometerReading;
    distanceCovered;
    vehicleId;
    vehicle;
    companyId;
    company;
    createdAt;
};
exports.MileageLog = MileageLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MileageLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], MileageLog.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { name: 'odometer_reading', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MileageLog.prototype, "odometerReading", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { name: 'distance_covered', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MileageLog.prototype, "distanceCovered", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id' }),
    __metadata("design:type", Number)
], MileageLog.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.Vehicle, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicle_id' }),
    __metadata("design:type", vehicle_entity_1.Vehicle)
], MileageLog.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", Number)
], MileageLog.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_entity_1.Company)
], MileageLog.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MileageLog.prototype, "createdAt", void 0);
exports.MileageLog = MileageLog = __decorate([
    (0, typeorm_1.Entity)('mileage_logs')
], MileageLog);
//# sourceMappingURL=mileage-log.entity.js.map