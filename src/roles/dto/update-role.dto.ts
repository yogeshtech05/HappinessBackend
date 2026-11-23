import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  roleId!: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions!: string[];
}
