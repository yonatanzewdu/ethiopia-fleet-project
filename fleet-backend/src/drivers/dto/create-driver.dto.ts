import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateDriverDto {
  @IsNumber()
  companyId: number;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsDateString()
  licenseExpiry: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  assignedVehicleId?: number;
}
