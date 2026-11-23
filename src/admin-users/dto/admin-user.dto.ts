import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export class CreateAdminUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  @IsString()
  roleId!: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

  @IsOptional()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password?: string;
}
