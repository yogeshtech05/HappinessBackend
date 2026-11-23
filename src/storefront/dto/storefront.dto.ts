import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class StoreOrderItemDto {
  @IsString()
  packageId!: string;

  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  selectedAddons?: { id: string; name: string; price: number }[];

  @IsOptional()
  @IsString()
  customMessage?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsNumber()
  @Min(0)
  totalPrice!: number;
}

export class CreateStoreOrderDto {
  @IsString()
  @MinLength(2)
  customerName!: string;

  @IsString()
  customerEmail!: string;

  @IsString()
  @MinLength(7)
  customerPhone!: string;

  @IsString()
  @MinLength(2)
  recipientName!: string;

  @IsString()
  recipientPhone!: string;

  @IsString()
  deliveryAddress!: string;

  @IsString()
  city!: string;

  @IsString()
  pincode!: string;

  @IsOptional()
  @IsString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  deliveryTimeSlot?: string;

  @IsOptional()
  @IsString()
  occasion?: string;

  @IsOptional()
  @IsString()
  presenterNote?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreOrderItemDto)
  items?: StoreOrderItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  addonsTotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
