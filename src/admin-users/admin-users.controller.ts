import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Controller('admin-users')
export class AdminUsersController {
  constructor(
    private readonly adminUsers: AdminUsersService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('admin_users.view')
  async findAll() {
    return { data: await this.adminUsers.findAll() };
  }

  @Post()
  @RequirePermissions('admin_users.create')
  async create(@Body() dto: CreateAdminUserDto, @CurrentUser() user: AuthenticatedAdmin) {
    const { id } = await this.adminUsers.create(dto);
    await this.activityLog.log(
      user,
      'Admin User Created',
      'AdminUser',
      id,
      `Created admin account for ${dto.email} (${dto.roleId})`,
    );
    return { data: { id } };
  }

  @Put(':id')
  @RequirePermissions('admin_users.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.adminUsers.update(id, dto);
    await this.activityLog.log(
      user,
      'Admin User Updated',
      'AdminUser',
      id,
      `Updated admin user ${id}`,
    );
    return { message: 'Admin user updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('admin_users.delete')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedAdmin) {
    await this.adminUsers.remove(id, user);
    await this.activityLog.log(
      user,
      'Admin User Deleted',
      'AdminUser',
      id,
      `Deleted admin user ID ${id}`,
    );
    return { message: 'Admin user deleted' };
  }
}
