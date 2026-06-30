import {
  IsString,
  IsNotEmpty,
  Matches,
  IsNumber,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateVehicleDto {
  @IsNumber()
  companyId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{1,3}-\d{5}$/, {
    message: 'plateNumber must match Ethiopian format, e.g. AA-12345',
  })
  plateNumber: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  chassisNumber: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentMileage?: number;

  @IsDateString()
  insuranceExpiry: string;

  @IsDateString()
  inspectionExpiry: string;
}
