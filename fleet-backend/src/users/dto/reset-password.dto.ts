import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters.' })
  newPassword: string;
}
