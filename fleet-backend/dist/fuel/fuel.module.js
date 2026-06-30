"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuelModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fuel_log_entity_1 = require("./entities/fuel-log.entity");
const mileage_log_entity_1 = require("../financials/entities/mileage-log.entity");
const fuel_request_entity_1 = require("./entities/fuel-request.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const fuel_service_1 = require("./fuel.service");
const fuel_controller_1 = require("./fuel.controller");
let FuelModule = class FuelModule {
};
exports.FuelModule = FuelModule;
exports.FuelModule = FuelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([fuel_log_entity_1.FuelLog, mileage_log_entity_1.MileageLog, fuel_request_entity_1.FuelRequest, driver_entity_1.Driver]),
        ],
        controllers: [fuel_controller_1.FuelController],
        providers: [fuel_service_1.FuelService],
        exports: [fuel_service_1.FuelService],
    })
], FuelModule);
//# sourceMappingURL=fuel.module.js.map