import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  password: string;

  @IsIn(['admin', 'manager', 'driver'])
  role: 'admin' | 'manager' | 'driver';

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  driverId?: number;
}