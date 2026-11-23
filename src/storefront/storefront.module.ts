import { Module } from '@nestjs/common';
import { OrdersModule } from 'src/orders/orders.module';
import { CouponsModule } from 'src/coupons/coupons.module';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';

@Module({
  imports: [OrdersModule, CouponsModule],
  controllers: [StorefrontController],
  providers: [StorefrontService],
})
export class StorefrontModule {}
