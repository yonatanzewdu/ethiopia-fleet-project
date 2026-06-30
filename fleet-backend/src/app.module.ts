import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from './companies/companies.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AlertsModule } from './alerts/alerts.module';
import { UsersModule } from './users/users.module';
import { FinancialsModule } from './financials/financials.module';
import { FuelModule } from './fuel/fuel.module';
import { ReportsModule } from './reports/reports.module';
import { GeofenceModule } from './geofence/geofence.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
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
    AuthModule,
    CompaniesModule,
    DriversModule,
    VehiclesModule,
    AlertsModule,
    UsersModule,
    FinancialsModule,
    FuelModule,
    ReportsModule,
    GeofenceModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}