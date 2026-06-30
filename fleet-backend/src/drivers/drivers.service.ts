import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { Company } from '../companies/entities/company.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(dto: CreateDriverDto): Promise<Driver> {
    const company = await this.companyRepository.findOne({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company #${dto.companyId} not found`);
    }

    const existing = await this.driverRepository.findOne({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (existing) {
      throw new BadRequestException(
        'A driver with this license number already exists.',
      );
    }

    let assignedVehicle: Vehicle | undefined = undefined;
    if (dto.assignedVehicleId) {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: dto.assignedVehicleId },
        relations: { assignedDriver: true },
      });
      if (!vehicle) {
        throw new NotFoundException(
          `Vehicle #${dto.assignedVehicleId} not found`,
        );
      }
      if (vehicle.assignedDriver) {
        throw new BadRequestException(
          `Vehicle #${dto.assignedVehicleId} is already assigned to another driver`,
        );
      }
      assignedVehicle = vehicle;
    }

    const driver = this.driverRepository.create({
      fullName: dto.fullName,
      licenseNumber: dto.licenseNumber,
      licenseExpiry: dto.licenseExpiry,
      phoneNumber: dto.phoneNumber,
      isActive: dto.isActive ?? true,
      company,
      ...(assignedVehicle ? { assignedVehicle } : {}),
    });

    return this.driverRepository.save(driver);
  }

  async findAll(companyId?: number): Promise<Driver[]> {
    const where: any = companyId ? { company: { id: companyId } } : {};
    return this.driverRepository.find({
      where,
      relations: { company: true, assignedVehicle: true },
    });
  }

  async findOne(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: { company: true, assignedVehicle: true },
    });
    if (!driver) {
      throw new NotFoundException(`Driver #${id} not found`);
    }
    return driver;
  }

  async update(id: number, dto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);

    if (dto.assignedVehicleId !== undefined) {
      if (dto.assignedVehicleId === null) {
        driver.assignedVehicle = undefined;
      } else {
        const vehicle = await this.vehicleRepository.findOne({
          where: { id: dto.assignedVehicleId },
          relations: { assignedDriver: true },
        });
        if (!vehicle) {
          throw new NotFoundException(
            `Vehicle #${dto.assignedVehicleId} not found`,
          );
        }
        if (vehicle.assignedDriver && vehicle.assignedDriver.id !== id) {
          throw new BadRequestException(
            `Vehicle #${dto.assignedVehicleId} is already assigned to another driver`,
          );
        }
        driver.assignedVehicle = vehicle;
      }
    }

    const { assignedVehicleId: _, companyId: __, ...rest } = dto;
    Object.assign(driver, rest);

    return this.driverRepository.save(driver);
  }

  async remove(id: number): Promise<void> {
    const driver = await this.findOne(id);
    await this.driverRepository.remove(driver);
  }
}
