import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(2)
  body!: string;

  @IsOptional()
  @IsIn(['ALL_CUSTOMERS', 'SPECIFIC_CUSTOMER', 'ADMINS'])
  targetAudience?: 'ALL_CUSTOMERS' | 'SPECIFIC_CUSTOMER' | 'ADMINS';

  @IsOptional()
  @IsString()
  recipientId?: string;
}
