import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { ActivityLogService } from './activity-log.service';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @RequirePermissions('activity_logs.view')
  async findAll(@Query('search') search?: string) {
    const logs = await this.activityLogService.list(search);
    return { data: logs };
  }
}
