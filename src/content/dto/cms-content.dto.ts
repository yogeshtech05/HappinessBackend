import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertCmsContentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateCmsSectionDto extends UpsertCmsContentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  sectionKey!: string;
}
