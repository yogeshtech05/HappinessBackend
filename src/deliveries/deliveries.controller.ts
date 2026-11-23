import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { DeliveriesService } from './deliveries.service';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@ApiTags('Deliveries')
@ApiBearerAuth()
@Controller('deliveries')
export class DeliveriesController {
  constructor(
    private readonly deliveries: DeliveriesService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('deliveries.view')
  async findAll(@Query('search') search?: string, @Query('status') status?: string) {
    return { data: await this.deliveries.findAll(search, status) };
  }

  @Put(':id')
  @RequirePermissions('deliveries.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.deliveries.update(id, dto);
    await this.activityLog.log(
      user,
      'Delivery Updated',
      'Delivery',
      id,
      `Delivery ${id} status updated to ${dto.status ?? 'unchanged'}`,
    );
    return { message: 'Delivery updated successfully' };
  }
}
