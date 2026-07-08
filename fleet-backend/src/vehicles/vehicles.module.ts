import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Company } from '../companies/entities/company.entity';
import { VehicleLocationHistory } from './entities/vehicle-location-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      Driver,
      Company,
      VehicleLocationHistory, // ← new: GPS history table
    ]),
  ],
  controllers: [VehiclesController],
  providers:   [VehiclesService],
  exports:     [VehiclesService], // export so a future TelematicsModule can inject it
})
export class VehiclesModule {}
