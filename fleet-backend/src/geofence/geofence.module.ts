import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Geofence } from './entities/geofence.entity';
import { GeofenceService } from './geofence.service';
import { GeofenceController } from './geofence.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Geofence])],
  controllers: [GeofenceController],
  providers: [GeofenceService],
  exports: [GeofenceService],
})
export class GeofenceModule {}
