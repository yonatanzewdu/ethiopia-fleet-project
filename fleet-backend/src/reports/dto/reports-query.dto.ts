import { IsOptional, IsInt, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportsQueryDto {
  // companyId is required — comes in as a string query param, coerced to number
  @Type(() => Number)
  @IsInt()
  companyId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vehicleId?: number;

  @IsOptional()
  @IsIn(['week', 'month'])
  granularity?: 'week' | 'month';
}