"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const companies_module_1 = require("./companies/companies.module");
const drivers_module_1 = require("./drivers/drivers.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const alerts_module_1 = require("./alerts/alerts.module");
const users_module_1 = require("./users/users.module");
const financials_module_1 = require("./financials/financials.module");
const fuel_module_1 = require("./fuel/fuel.module");
const reports_module_1 = require("./reports/reports.module");
const geofence_module_1 = require("./geofence/geofence.module");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./auth/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST || 'localhost',
                port: process.env.DATABASE_URL ? undefined : Number(process.env.DB_PORT) || 5432,
                username: process.env.DATABASE_URL ? undefined : process.env.DB_USERNAME || 'postgres',
                password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD || 'postgres',
                database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME || 'ethiopia_fleet_db',
                autoLoadEntities: true,
                synchronize: process.env.DB_SYNCHRONIZE === 'true',
                ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
            }),
            auth_module_1.AuthModule,
            companies_module_1.CompaniesModule,
            drivers_module_1.DriversModule,
            vehicles_module_1.VehiclesModule,
            alerts_module_1.AlertsModule,
            users_module_1.UsersModule,
            financials_module_1.FinancialsModule,
            fuel_module_1.FuelModule,
            reports_module_1.ReportsModule,
            geofence_module_1.GeofenceModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map