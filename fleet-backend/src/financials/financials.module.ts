import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialTransaction } from './entities/financial-transaction.entity';
import { MileageLog } from './entities/mileage-log.entity';
import { FinancialsService } from './financials.service';
import { FinancialsController } from './financials.controller';
import { FuelLog } from '../fuel/entities/fuel-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinancialTransaction,
      MileageLog,
      FuelLog,
    ]),
  ],
  controllers: [FinancialsController],
  providers:   [FinancialsService],
  exports:     [FinancialsService],
})
export class FinancialsModule {}