import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OrderStatus, PaymentStatus } from 'src/common/types/domain';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'REFUNDED', 'FAILED'];

export class OrderItemDto {
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

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  customerId?: string;

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

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsString()
  @MinLength(5)
  deliveryAddress!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

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
  @IsBoolean()
  presenterRequired?: boolean;

  @IsOptional()
  @IsString()
  presenterNote?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

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
  discountAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatus;

  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  assignedStaffId?: string | null;

  @IsOptional()
  @IsString()
  assignedStaffName?: string | null;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  assignedStaffId?: string | null;

  @IsOptional()
  @IsString()
  assignedStaffName?: string | null;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
