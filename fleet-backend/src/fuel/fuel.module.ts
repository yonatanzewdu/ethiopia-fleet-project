import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Existing entities
import { FuelLog } from './entities/fuel-log.entity';
import { MileageLog } from '../financials/entities/mileage-log.entity';
import { FuelRequest } from './entities/fuel-request.entity';

// FIX: FuelService now injects the Driver repo to resolve a driver's
// real assigned vehicle (replacing the old hardcoded mock), so Driver
// must be registered here too.
import { Driver } from '../drivers/entities/driver.entity';

import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FuelLog, MileageLog, FuelRequest, Driver]),
  ],
  controllers: [FuelController],
  providers: [FuelService],
  exports: [FuelService],
})
export class FuelModule {}