import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { UpsertGeofenceDto } from './dto/upsert-geofence.dto';

@Controller('geofence')
export class GeofenceController {
  constructor(private readonly svc: GeofenceService) {}

  // GET /geofence?companyId=2
  // All geofences for the company in one call, so the frontend can build a
  // { [vehicleId]: { lat, lng, radius } } map without N requests.
  @Get()
  getForCompany(@Req() req: any, @Query('companyId') companyIdQuery?: string) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.getForCompany(companyId);
  }

  // GET /geofence/:vehicleId?companyId=2
  @Get(':vehicleId')
  getForVehicle(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Req() req: any,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.getForVehicle(vehicleId, companyId);
  }

  // PUT /geofence/:vehicleId?companyId=2   body: { lat, lng, radius }
  @Put(':vehicleId')
  upsertForVehicle(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() dto: UpsertGeofenceDto,
    @Req() req: any,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.upsertForVehicle(vehicleId, companyId, dto);
  }

  // DELETE /geofence/:vehicleId?companyId=2  -- reset a vehicle to "no geofence"
  @Delete(':vehicleId')
  deleteForVehicle(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Req() req: any,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.deleteForVehicle(vehicleId, companyId);
  }
}
