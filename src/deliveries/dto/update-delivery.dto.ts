import { IsIn, IsOptional, IsString } from 'class-validator';

const DELIVERY_STATUSES = [
  'UNASSIGNED',
  'ASSIGNED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FAILED',
  'CANCELLED',
];

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  assignedPresenterId?: string | null;

  @IsOptional()
  @IsString()
  assignedPresenterName?: string | null;

  @IsOptional()
  @IsIn(DELIVERY_STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
