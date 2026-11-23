import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsIn(['APPROVED', 'PENDING', 'REJECTED'])
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
