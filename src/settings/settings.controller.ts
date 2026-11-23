import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('settings.view')
  async get() {
    return { data: await this.settings.get() };
  }

  @Put()
  @RequirePermissions('settings.update')
  async update(@Body() dto: UpdateSettingsDto, @CurrentUser() user: AuthenticatedAdmin) {
    await this.settings.update(dto);
    await this.activityLog.log(
      user,
      'Settings Updated',
      'Settings',
      'main',
      'Updated store settings',
    );
    return { message: 'Settings updated successfully' };
  }
}
