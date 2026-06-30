import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
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
}
