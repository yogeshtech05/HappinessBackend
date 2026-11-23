import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId } from 'src/common/utils/id.util';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: { id: string };
  discountAmount: number;
  reason?: string;
}

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return (await this.prisma.coupons.findMany({ orderBy: { created_at: 'desc' } })).map((coupon) => this.toRecord(coupon));
  }

  async create(dto: CreateCouponDto): Promise<{ id: string; code: string }> {
    const code = (dto.code ?? 'SURPRISE10').toUpperCase();
    const today = new Date().toISOString().split('T')[0];

    const id = generateId('cup');
    await this.prisma.coupons.create({ data: {
      id,
      code,
      description: dto.description ?? '',
      discount_type: dto.discountType ?? 'PERCENTAGE', discount_value: dto.discountValue ?? 10,
      min_order_value: dto.minOrderValue ?? 0, max_discount_amount: dto.maxDiscountAmount ?? null,
      usage_limit: dto.usageLimit ?? 100, usage_count: 0, start_date: dto.startDate ?? today,
      expiry_date:
        dto.expiryDate ?? new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      is_active: dto.isActive ?? true,
    }});
    return { id, code };
  }

  async update(id: string, dto: UpdateCouponDto): Promise<void> {
    const coupon = await this.prisma.coupons.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    await this.prisma.coupons.update({ where: { id }, data: { code: dto.code?.toUpperCase(), description: dto.description, discount_type: dto.discountType, discount_value: dto.discountValue, min_order_value: dto.minOrderValue, max_discount_amount: dto.maxDiscountAmount, usage_limit: dto.usageLimit, start_date: dto.startDate, expiry_date: dto.expiryDate, is_active: dto.isActive } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.prisma.coupons.deleteMany({ where: { id } });
    if (!result.count) {
      throw new NotFoundException('Coupon not found');
    }
  }

  async incrementUsage(id: string): Promise<void> {
    await this.prisma.coupons.update({ where: { id }, data: { usage_count: { increment: 1 } } });
  }

  async validate(code: string, subtotal: number): Promise<CouponValidationResult> {
    const coupon = await this.prisma.coupons.findFirst({ where: { code: { equals: code.trim(), mode: 'insensitive' } } });

    if (!coupon) {
      return { valid: false, discountAmount: 0, reason: 'Invalid coupon code.' };
    }

    const today = new Date();
    const validFrom = new Date(coupon.start_date);
    const validUntil = new Date(coupon.expiry_date);
    today.setHours(0, 0, 0, 0);
    validUntil.setHours(23, 59, 59, 999);

    if (!coupon.is_active) {
      return { valid: false, discountAmount: 0, reason: 'This coupon is no longer active.' };
    }
    if (today < validFrom || today > validUntil) {
      return { valid: false, discountAmount: 0, reason: 'This coupon has expired.' };
    }
    if ((coupon.usage_count ?? 0) >= (coupon.usage_limit ?? 0)) {
      return {
        valid: false,
        discountAmount: 0,
        reason: 'This coupon has reached its usage limit.',
      };
    }
    if (subtotal < Number(coupon.min_order_value ?? 0)) {
      return {
        valid: false,
        discountAmount: 0,
        reason: `Minimum order value of ₹${coupon.min_order_value} required.`,
      };
    }

    let discountAmount =
      coupon.discount_type === 'PERCENTAGE' ? (subtotal * Number(coupon.discount_value)) / 100 : Number(coupon.discount_value);

    if (coupon.max_discount_amount !== null) {
      discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
    }
    discountAmount = Math.min(discountAmount, subtotal);

    return { valid: true, coupon: { id: coupon.id }, discountAmount: Math.round(discountAmount * 100) / 100 };
  }

  private toRecord(coupon: Awaited<ReturnType<PrismaService['coupons']['findUniqueOrThrow']>>) {
    return { id: coupon.id, code: coupon.code, description: coupon.description, discountType: coupon.discount_type, discountValue: Number(coupon.discount_value), minOrderValue: Number(coupon.min_order_value ?? 0), maxDiscountAmount: coupon.max_discount_amount === null ? null : Number(coupon.max_discount_amount), usageLimit: coupon.usage_limit ?? 0, usageCount: coupon.usage_count ?? 0, startDate: coupon.start_date, expiryDate: coupon.expiry_date, isActive: coupon.is_active ?? false, createdAt: coupon.created_at, updatedAt: coupon.updated_at };
  }
}
