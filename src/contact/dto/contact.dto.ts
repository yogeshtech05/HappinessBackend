import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  name!: string;

  @IsEmail()
  @MaxLength(128)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  occasion?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  message!: string;
}

export class UpdateContactMessageDto {
  @IsIn(['NEW', 'IN_PROGRESS', 'RESOLVED'])
  status!: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
}
