import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ParseFloatPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.vehiclesService.findAll(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.remove(id);
  }

  @Patch(':id/assign-driver')
  assignDriver(
    @Param('id', ParseIntPipe) id: number,
    @Body('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.vehiclesService.assignDriver(id, driverId);
  }

  @Patch(':id/release-driver')
  releaseDriver(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.releaseDriver(id);
  }

  // ── GPS HISTORY ────────────────────────────────────────────────────────────

  /**
   * GET /vehicles/:id/location-history?from=ISO&to=ISO
   *
   * Returns an array of { lat, lng, speed, heading, recordedAt } objects
   * ordered oldest → newest for the requested time window.
   *
   * Example:
   *   GET /vehicles/3/location-history?from=2025-07-01T00:00:00Z&to=2025-07-01T06:00:00Z
   */
  @Get(':id/location-history')
  getLocationHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('from') from: string,
    @Query('to')   to:   string,
  ) {
    if (!from || !to) {
      throw new BadRequestException(
        'Query params "from" and "to" are required (ISO 8601 datetime strings).',
      );
    }
    const fromDate = new Date(from);
    const toDate   = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException(
        '"from" and "to" must be valid ISO 8601 datetime strings.',
      );
    }
    if (fromDate >= toDate) {
      throw new BadRequestException('"from" must be earlier than "to".');
    }
    return this.vehiclesService.getLocationHistory(id, fromDate, toDate);
  }

  /**
   * POST /vehicles/:id/location
   *
   * Ingest a single GPS ping for a vehicle.
   * Body: { lat: number, lng: number, speed?: number, heading?: number }
   *
   * Called by your telematics hardware gateway or WebSocket ingestion service.
   */
  @Post(':id/location')
  recordLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body('lat',     ParseFloatPipe) lat:     number,
    @Body('lng',     ParseFloatPipe) lng:     number,
    @Body('speed')                   speed?:  number,
    @Body('heading')                 heading?: number,
  ) {
    return this.vehiclesService.recordLocation(id, lat, lng, speed, heading);
  }
}
