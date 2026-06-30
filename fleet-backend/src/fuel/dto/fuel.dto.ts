import {
  IsNumber, IsOptional, IsString,
  IsDateString, Min,
} from 'class-validator';

export class CreateFuelLogDto {
  @IsNumber()
  vehicleId: number;

  @IsOptional()
  @IsNumber()
  driverId?: number;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0.01)
  litres: number;

  @IsNumber()
  @Min(0.01)
  pricePerLitre: number;

  @IsNumber()
  @Min(0)
  odometerReading: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  companyId?: number;
}
