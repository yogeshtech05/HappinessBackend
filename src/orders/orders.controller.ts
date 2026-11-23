import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { getPagination } from 'src/common/dto/pagination-query.dto';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('orders.view')
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const { page: currentPage, limit: currentLimit } = getPagination({ page, limit });
    return this.orders.findAll(search, status, currentPage, currentLimit);
  }

  @Get(':id')
  @RequirePermissions('orders.view')
  async findOne(@Param('id') id: string) {
    return { data: await this.orders.findOne(id) };
  }

  @Post()
  @RequirePermissions('orders.update')
  async create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthenticatedAdmin) {
    const { id, orderNumber } = await this.orders.create(dto, user);
    await this.activityLog.log(
      user,
      'Order Created',
      'Order',
      id,
      `Created order ${orderNumber} for ${dto.customerName}`,
    );
    return { data: { id, orderNumber } };
  }

  @Put(':id')
  @RequirePermissions('orders.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.orders.update(id, dto, user);
    const order = await this.orders.findOne(id);
    await this.activityLog.log(
      user,
      'Order Updated',
      'Order',
      id,
      `Order ${order.orderNumber} status updated to ${dto.status ?? order.status}`,
    );
    return { message: 'Order updated successfully' };
  }
}
