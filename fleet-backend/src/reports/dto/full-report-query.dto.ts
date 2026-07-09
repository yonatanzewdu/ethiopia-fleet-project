import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsDateString } from 'class-validator';

// Adjust the decorators here if your existing ReportsQueryDto uses a
// different validation style — this mirrors the common class-validator
// pattern (companyId as a required transformed int, date optional).
export class FullReportQueryDto {
  @Type(() => Number)
  @IsInt()
  companyId: number;

  // "As of" snapshot date — defaults to today if omitted.
  // The report covers all fleet records from inception through this date.
  @IsOptional()
  @IsDateString()
  date?: string;
}
