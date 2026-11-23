import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  brandTagline?: string;

  @IsOptional()
  @IsString()
  helplinePhone?: string;

  @IsOptional()
  @IsString()
  helplineEmail?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxRatePercent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  defaultDeliveryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  freeDeliveryThreshold?: number;

  @IsOptional()
  @IsString()
  orderPrefix?: string;

  @IsOptional()
  @IsBoolean()
  allowSameDayBooking?: boolean;

  @IsOptional()
  @IsString()
  bookingCutoffTime?: string;

  @IsOptional()
  @IsBoolean()
  autoAssignPresenters?: boolean;
}
