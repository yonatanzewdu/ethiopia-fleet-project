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
exports.Geofence = void 0;
const typeorm_1 = require("typeorm");
const vehicle_entity_1 = require("../../vehicles/entities/vehicle.entity");
const company_entity_1 = require("../../companies/entities/company.entity");
let Geofence = class Geofence {
    id;
    vehicleId;
    vehicle;
    companyId;
    company;
    lat;
    lng;
    radius;
    updatedAt;
};
exports.Geofence = Geofence;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Geofence.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id', unique: true }),
    __metadata("design:type", Number)
], Geofence.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.Vehicle, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicle_id' }),
    __metadata("design:type", vehicle_entity_1.Vehicle)
], Geofence.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", Number)
], Geofence.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_entity_1.Company)
], Geofence.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 9, scale: 6 }),
    __metadata("design:type", Number)
], Geofence.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 9, scale: 6 }),
    __metadata("design:type", Number)
], Geofence.prototype, "lng", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 2000 }),
    __metadata("design:type", Number)
], Geofence.prototype, "radius", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Geofence.prototype, "updatedAt", void 0);
exports.Geofence = Geofence = __decorate([
    (0, typeorm_1.Entity)('geofences')
], Geofence);
//# sourceMappingURL=geofence.entity.js.map