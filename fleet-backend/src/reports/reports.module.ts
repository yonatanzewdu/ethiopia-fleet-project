import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialTransaction } from '../financials/entities/financial-transaction.entity';
import { MileageLog } from '../financials/entities/mileage-log.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

/**
 * ReportsModule
 * ─────────────────────────────────────────────────────────────────────────────
 * Read-only analytics layer on top of the existing financials/ data.
 * No new entities of its own -- it reuses FinancialTransaction and MileageLog
 * via TypeOrmModule.forFeature, so no new tables/migrations are required.
 *
 * REGISTRATION IN app.module.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *   imports: [
 *     ...existing modules...
 *     FinancialsModule,
 *     ReportsModule,
 *   ]
 */
@Module({
  imports: [TypeOrmModule.forFeature([FinancialTransaction, MileageLog])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}