import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OccasionType } from 'src/common/types/domain';

const IMAGE_THEMES = ['pink', 'gold', 'rose', 'plum', 'amber', 'emerald'];

export class PackageAddonDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  description!: string;
}

export class PackageFeatureDto {
  @IsString()
  title!: string;

  @IsBoolean()
  included!: boolean;
}

export class BasePackageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['birthday', 'anniversary', 'parents', 'romantic', 'congratulations', 'festivals'])
  occasion?: OccasionType;

  @IsOptional()
  @IsString()
  occasionLabel?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageFeatureDto)
  features?: PackageFeatureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageAddonDto)
  addons?: PackageAddonDto[];

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsIn(IMAGE_THEMES)
  imageTheme?: string;

  @IsOptional()
  @IsString()
  visualIcon?: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class CreatePackageDto extends BasePackageDto {
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdatePackageDto extends BasePackageDto {}
