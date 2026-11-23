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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customers: CustomersService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('customers.view')
  async findAll(@Query('search') search?: string, @Query('status') status?: string) {
    return { data: await this.customers.findAll(search, status) };
  }

  @Get(':id')
  @RequirePermissions('customers.view')
  async findOne(@Param('id') id: string) {
    const { customer, orders } = await this.customers.findOneWithOrders(id);
    return { data: { customer, orders } };
  }

  @Post()
  @RequirePermissions('customers.create')
  async create(@Body() dto: CreateCustomerDto, @CurrentUser() user: AuthenticatedAdmin) {
    const { id } = await this.customers.create(dto);
    await this.activityLog.log(
      user,
      'Customer Created',
      'Customer',
      id,
      `Created customer ${dto.name}`,
    );
    return { data: { id } };
  }

  @Put(':id')
  @RequirePermissions('customers.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.customers.update(id, dto);
    await this.activityLog.log(
      user,
      'Customer Updated',
      'Customer',
      id,
      `Updated customer ${dto.name} (${dto.status})`,
    );
    return { message: 'Customer updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('customers.delete')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedAdmin) {
    await this.customers.remove(id);
    await this.activityLog.log(
      user,
      'Customer Deleted',
      'Customer',
      id,
      `Deleted customer ID ${id}`,
    );
    return { message: 'Customer deleted' };
  }
}
