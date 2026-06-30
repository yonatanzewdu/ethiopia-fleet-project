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
exports.FinancialsController = void 0;
const common_1 = require("@nestjs/common");
const financials_service_1 = require("./financials.service");
const financials_dto_1 = require("./dto/financials.dto");
const financial_transaction_entity_1 = require("./entities/financial-transaction.entity");
let FinancialsController = class FinancialsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    createManagerTransaction(dto, req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(dto.companyId) ?? Number(companyIdQuery);
        return this.svc.createManagerTransaction(dto, companyId);
    }
    createDriverReceipt(dto, req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(dto.companyId) ?? Number(companyIdQuery);
        const driverId = req.user?.driverId ?? Number(dto.driverId);
        if (!driverId || Number.isNaN(driverId)) {
            throw new common_1.BadRequestException('This account is not linked to a driver record -- ask an admin to link it.');
        }
        return this.svc.createDriverReceipt(dto, companyId, driverId);
    }
    getTransactions(req, status, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.getTransactionsByCompany(companyId, status);
    }
    updateApproval(id, dto, req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.updateApprovalStatus(id, dto, companyId);
    }
    createMileageLog(dto, req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(dto.companyId) ?? Number(companyIdQuery);
        return this.svc.createMileageLog(dto, companyId);
    }
    getMileageLogs(req, vehicleIdQuery, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        const vehicleId = vehicleIdQuery ? Number(vehicleIdQuery) : undefined;
        return this.svc.getMileageLogs(companyId, vehicleId);
    }
    getCpk(req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.getCostPerKilometre(companyId);
    }
    getFleetSummary(req, companyIdQuery) {
        const companyId = req.user?.companyId ?? Number(companyIdQuery);
        return this.svc.getFleetSummary(companyId);
    }
};
exports.FinancialsController = FinancialsController;
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [financials_dto_1.CreateTransactionDto, Object, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "createManagerTransaction", null);
__decorate([
    (0, common_1.Post)('receipts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [financials_dto_1.CreateTransactionDto, Object, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "createDriverReceipt", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Patch)('transactions/:id/approval'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, financials_dto_1.UpdateApprovalDto, Object, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "updateApproval", null);
__decorate([
    (0, common_1.Post)('mileage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [financials_dto_1.CreateMileageLogDto, Object, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "createMileageLog", null);
__decorate([
    (0, common_1.Get)('mileage'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('vehicleId')),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "getMileageLogs", null);
__decorate([
    (0, common_1.Get)('cpk'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "getCpk", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "getFleetSummary", null);
exports.FinancialsController = FinancialsController = __decorate([
    (0, common_1.Controller)('financials'),
    __metadata("design:paramtypes", [financials_service_1.FinancialsService])
], FinancialsController);
//# sourceMappingURL=financials.controller.js.map