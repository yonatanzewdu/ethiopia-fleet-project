import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { FinancialTransaction } from '../financials/entities/financial-transaction.entity';
import { MileageLog } from '../financials/entities/mileage-log.entity';
import { FuelLog } from '../fuel/entities/fuel-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialTransaction, MileageLog, FuelLog])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
