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
exports.FinancialTransaction = exports.ApprovalStatus = exports.TransactionCategory = void 0;
const typeorm_1 = require("typeorm");
const vehicle_entity_1 = require("../../vehicles/entities/vehicle.entity");
const company_entity_1 = require("../../companies/entities/company.entity");
var TransactionCategory;
(function (TransactionCategory) {
    TransactionCategory["MAINTENANCE"] = "MAINTENANCE";
    TransactionCategory["INSURANCE"] = "INSURANCE";
    TransactionCategory["TIRES"] = "TIRES";
    TransactionCategory["REGISTRATION"] = "REGISTRATION";
    TransactionCategory["ROAD_TOLL"] = "ROAD_TOLL";
    TransactionCategory["OTHER"] = "OTHER";
})(TransactionCategory || (exports.TransactionCategory = TransactionCategory = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
let FinancialTransaction = class FinancialTransaction {
    id;
    amount;
    category;
    description;
    receiptUrl;
    approvalStatus;
    date;
    vehicleId;
    vehicle;
    companyId;
    company;
    driverId;
    createdAt;
};
exports.FinancialTransaction = FinancialTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FinancialTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], FinancialTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TransactionCategory }),
    __metadata("design:type", String)
], FinancialTransaction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FinancialTransaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_url', nullable: true }),
    __metadata("design:type", String)
], FinancialTransaction.prototype, "receiptUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'approval_status',
        type: 'enum',
        enum: ApprovalStatus,
        default: ApprovalStatus.APPROVED,
    }),
    __metadata("design:type", String)
], FinancialTransaction.prototype, "approvalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], FinancialTransaction.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id', nullable: true }),
    __metadata("design:type", Number)
], FinancialTransaction.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.Vehicle, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicle_id' }),
    __metadata("design:type", vehicle_entity_1.Vehicle)
], FinancialTransaction.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_id' }),
    __metadata("design:type", Number)
], FinancialTransaction.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'company_id' }),
    __metadata("design:type", company_entity_1.Company)
], FinancialTransaction.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'driver_id', nullable: true }),
    __metadata("design:type", Number)
], FinancialTransaction.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FinancialTransaction.prototype, "createdAt", void 0);
exports.FinancialTransaction = FinancialTransaction = __decorate([
    (0, typeorm_1.Entity)('financial_transactions')
], FinancialTransaction);
//# sourceMappingURL=financial-transaction.entity.js.map