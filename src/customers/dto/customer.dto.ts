import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const STATUSES = ['ACTIVE', 'INACTIVE', 'BLOCKED'];

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto {
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
  @MinLength(7)
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
