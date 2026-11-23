import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { StorefrontService } from './storefront.service';
import { CreateStoreOrderDto } from './dto/storefront.dto';

@ApiTags('Storefront')
@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}

  @Get('summary')
  @Public()
  async getSummary() {
    return { data: await this.storefront.getSummary() };
  }

  @Get('packages/:slug')
  @Public()
  async getPackage(@Param('slug') slug: string) {
    return { data: await this.storefront.findActivePackage(slug) };
  }

  @Get('coupons/validate')
  @Public()
  async validateCoupon(@Query('code') code: string, @Query('subtotal') subtotal?: string) {
    const result = await this.storefront.validateCoupon(code, parseFloat(subtotal ?? '0'));
    return {
      data: {
        valid: result.valid,
        discountAmount: result.discountAmount,
        reason: result.reason,
      },
    };
  }

  @Post('orders')
  @Public()
  async createOrder(@Body() dto: CreateStoreOrderDto) {
    const order = await this.storefront.createOrder(dto);
    return { data: order };
  }
}
