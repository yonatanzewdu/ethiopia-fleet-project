import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Driver, Company])], // Injected Driver repository
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}