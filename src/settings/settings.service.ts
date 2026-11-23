import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

export interface SettingsRecord {
  id: string; businessName: string; brandTagline: string | null; helplinePhone: string | null;
  helplineEmail: string | null; address: string | null; city: string | null; state: string | null;
  pincode: string | null; currencySymbol: string | null; taxRatePercent: number;
  defaultDeliveryFee: number; freeDeliveryThreshold: number; orderPrefix: string | null;
  allowSameDayBooking: boolean; bookingCutoffTime: string | null; autoAssignPresenters: boolean;
  updatedAt: Date | null;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SettingsRecord> {
    const settings = await this.prisma.store_settings.upsert({ where: { id: 'main' }, update: {}, create: { id: 'main' } });
    return this.toRecord(settings);
  }

  async update(dto: UpdateSettingsDto): Promise<void> {
    await this.prisma.store_settings.upsert({
      where: { id: 'main' },
      create: { id: 'main' },
      update: {
        business_name: dto.businessName, brand_tagline: dto.brandTagline,
        helpline_phone: dto.helplinePhone, helpline_email: dto.helplineEmail,
        address: dto.address, city: dto.city, state: dto.state, pincode: dto.pincode,
        currency_symbol: dto.currencySymbol, tax_rate_percent: dto.taxRatePercent,
        default_delivery_fee: dto.defaultDeliveryFee, free_delivery_threshold: dto.freeDeliveryThreshold,
        order_prefix: dto.orderPrefix, allow_same_day_booking: dto.allowSameDayBooking,
        booking_cutoff_time: dto.bookingCutoffTime, auto_assign_presenters: dto.autoAssignPresenters,
      },
    });
  }

  private toRecord(value: Awaited<ReturnType<PrismaService['store_settings']['findUniqueOrThrow']>>): SettingsRecord {
    return {
      id: value.id, businessName: value.business_name, brandTagline: value.brand_tagline,
      helplinePhone: value.helpline_phone, helplineEmail: value.helpline_email, address: value.address,
      city: value.city, state: value.state, pincode: value.pincode, currencySymbol: value.currency_symbol,
      taxRatePercent: Number(value.tax_rate_percent), defaultDeliveryFee: Number(value.default_delivery_fee),
      freeDeliveryThreshold: Number(value.free_delivery_threshold), orderPrefix: value.order_prefix,
      allowSameDayBooking: value.allow_same_day_booking ?? true, bookingCutoffTime: value.booking_cutoff_time,
      autoAssignPresenters: value.auto_assign_presenters ?? false, updatedAt: value.updated_at,
    };
  }
}
