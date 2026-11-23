import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(
    private readonly roles: RolesService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('roles.view')
  async findAll() {
    return { data: await this.roles.findAll() };
  }

  @Put()
  @RequirePermissions('roles.manage')
  async update(@Body() dto: UpdateRoleDto, @CurrentUser() user: AuthenticatedAdmin) {
    await this.roles.update(dto.roleId, dto.permissions);
    await this.activityLog.log(
      user,
      'Role Permissions Modified',
      'Role',
      dto.roleId,
      `Updated permissions matrix for role ${dto.roleId}`,
    );
    return { message: 'Role permissions updated successfully' };
  }
}
