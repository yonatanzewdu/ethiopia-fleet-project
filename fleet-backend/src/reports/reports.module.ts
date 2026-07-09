import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsPdfService } from './reports-pdf.service';
import { FinancialTransaction } from '../financials/entities/financial-transaction.entity';
import { MileageLog } from '../financials/entities/mileage-log.entity';
import { FuelLog } from '../fuel/entities/fuel-log.entity';
// NOTE: adjust these import paths if they differ in your project —
// see the matching note in reports.service.ts.
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Geofence } from '../geofence/entities/geofence.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinancialTransaction,
      MileageLog,
      FuelLog,
      Vehicle,
      Driver,
      Geofence,
      Company,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsPdfService],
  exports: [ReportsService],
})
export class ReportsModule {}
