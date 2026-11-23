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
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(
    private readonly coupons: CouponsService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('coupons.view')
  async findAll() {
    return { data: await this.coupons.findAll() };
  }

  @Post()
  @RequirePermissions('coupons.create')
  async create(@Body() dto: CreateCouponDto, @CurrentUser() user: AuthenticatedAdmin) {
    const { id, code } = await this.coupons.create(dto);
    await this.activityLog.log(user, 'Coupon Created', 'Coupon', id, `Created coupon ${code}`);
    return { data: { id, code } };
  }

  @Put(':id')
  @RequirePermissions('coupons.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.coupons.update(id, dto);
    await this.activityLog.log(
      user,
      'Coupon Updated',
      'Coupon',
      id,
      `Updated coupon ${dto.code ?? id}`,
    );
    return { message: 'Coupon updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('coupons.delete')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedAdmin) {
    await this.coupons.remove(id);
    await this.activityLog.log(user, 'Coupon Deleted', 'Coupon', id, `Deleted coupon ID ${id}`);
    return { message: 'Coupon deleted' };
  }
}
