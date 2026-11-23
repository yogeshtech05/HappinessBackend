import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('notifications.view')
  async findAll() {
    return { data: await this.notifications.findAll() };
  }

  @Post()
  @RequirePermissions('notifications.send')
  async create(@Body() dto: CreateNotificationDto, @CurrentUser() user: AuthenticatedAdmin) {
    const { id } = await this.notifications.create(dto, user.name);
    await this.activityLog.log(
      user,
      'Notification Broadcast',
      'Notification',
      id,
      `Sent notification: ${dto.title}`,
    );
    return { data: { id } };
  }
}
