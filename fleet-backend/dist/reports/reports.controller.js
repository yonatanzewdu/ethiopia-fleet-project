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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const reports_query_dto_1 = require("./dto/reports-query.dto");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getDashboard(query) {
        return this.reportsService.getDashboard(query.companyId, query);
    }
    getExpenseBreakdown(query) {
        return this.reportsService.getExpenseBreakdown(query.companyId, query);
    }
    getCpkTrend(query) {
        return this.reportsService.getCpkTrend(query.companyId, query);
    }
    getAssetUtilization(query) {
        return this.reportsService.getAssetUtilization(query.companyId, query);
    }
    getVehicleComparison(query) {
        return this.reportsService.getVehicleComparison(query.companyId, query);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_query_dto_1.ReportsQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('expense-breakdown'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_query_dto_1.ReportsQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getExpenseBreakdown", null);
__decorate([
    (0, common_1.Get)('cpk-trend'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_query_dto_1.ReportsQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCpkTrend", null);
__decorate([
    (0, common_1.Get)('asset-utilization'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_query_dto_1.ReportsQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAssetUtilization", null);
__decorate([
    (0, common_1.Get)('vehicle-comparison'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_query_dto_1.ReportsQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getVehicleComparison", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map