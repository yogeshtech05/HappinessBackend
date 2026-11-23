import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId } from 'src/common/utils/id.util';
import { OrderItem } from 'src/common/types/domain';
import { OrdersService } from 'src/orders/orders.service';
import { CouponsService } from 'src/coupons/coupons.service';
import { CreateStoreOrderDto } from './dto/storefront.dto';

export class PublicSettings {
  businessName!: string; brandTagline!: string | null; helplinePhone!: string | null; helplineEmail!: string | null; address!: string | null; currencySymbol!: string; defaultDeliveryFee!: number; freeDeliveryThreshold!: number; allowSameDayBooking!: boolean; bookingCutoffTime!: string;
}

@Injectable()
export class StorefrontService {
  constructor(private readonly prisma: PrismaService, private readonly ordersService: OrdersService, private readonly coupons: CouponsService) {}

  async getSummary() {
    const [packages, categories, reviews, content, settings] = await Promise.all([
      this.prisma.packages.findMany({ where: { is_active: true }, orderBy: { created_at: 'desc' } }),
      this.prisma.categories.findMany({ orderBy: { created_at: 'asc' } }),
      this.prisma.reviews.findMany({ where: { status: 'APPROVED' }, orderBy: { created_at: 'desc' }, take: 6 }),
      this.prisma.cms_content.findMany({ orderBy: { updated_at: 'desc' } }),
      this.prisma.store_settings.findUnique({ where: { id: 'main' } }),
    ]);
    return {
      packages: packages.map((item) => this.package(item)), categories: categories.map((item) => ({ id: item.id, name: item.name, slug: item.slug, tagline: item.tagline, icon: item.icon, packageCount: item.package_count ?? 0, gradient: item.gradient, accentColor: item.accent_color })),
      reviews: reviews.map((item) => ({ id: item.id, customerName: item.customer_name, rating: item.rating, reviewText: item.comment, title: item.title, packageName: item.package_name })),
      content: content.map((item) => ({ id: item.id, sectionKey: item.section_key, title: item.title, subtitle: item.subtitle, content: item.content, imageUrl: item.image_url, metadata: this.json(item.metadata), updatedBy: item.updated_by, updatedAt: item.updated_at })),
      settings: settings ? this.toPublicSettings(settings) : null,
    };
  }

  async findActivePackage(slug: string) { const item = await this.prisma.packages.findFirst({ where: { is_active: true, slug } }); return item ? this.package(item) : null; }
  async validateCoupon(code: string, subtotal: number) { return this.coupons.validate(code, subtotal); }

  async createOrder(dto: CreateStoreOrderDto) {
    const customer = await this.upsertCustomer(dto);
    const requested = dto.items ?? [];
    if (!requested.length) throw new BadRequestException('At least one package is required.');
    const catalog = await this.prisma.packages.findMany({ where: { id: { in: requested.map((item) => item.packageId) }, is_active: true } });
    if (catalog.length !== new Set(requested.map((item) => item.packageId)).size) throw new BadRequestException('One or more selected packages are unavailable.');
    const packagesById = new Map(catalog.map((item) => [item.id, item]));
    const items: OrderItem[] = requested.map((item) => {
      const packageItem = packagesById.get(item.packageId)!;
      const allowedAddons = new Map((this.json(packageItem.addons) as Array<{ id?: string; name?: string; price?: number }> | null ?? []).filter((addon) => addon.id && typeof addon.price === 'number').map((addon) => [addon.id!, addon]));
      const selectedAddons = (item.selectedAddons ?? []).map((addon) => {
        const allowed = allowedAddons.get(addon.id);
        if (!allowed) throw new BadRequestException(`Invalid add-on selected for ${packageItem.title}.`);
        return { id: allowed.id!, name: allowed.name ?? addon.name, price: allowed.price! };
      });
      const price = Number(packageItem.price); const quantity = item.quantity;
      return { packageId: packageItem.id, title: packageItem.title, slug: packageItem.slug, price, quantity, selectedAddons, customMessage: item.customMessage ?? undefined, recipientName: item.recipientName ?? dto.recipientName, totalPrice: (price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0)) * quantity };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const addonsTotal = items.reduce((sum, item) => sum + item.selectedAddons.reduce((addonSum, addon) => addonSum + addon.price, 0) * item.quantity, 0);
    const settings = await this.prisma.store_settings.findUnique({ where: { id: 'main' } });
    const deliveryFee = settings && subtotal + addonsTotal >= Number(settings.free_delivery_threshold) ? 0 : Number(settings?.default_delivery_fee ?? 0);
    let discountAmount = 0;
    if (dto.couponCode) { const result = await this.coupons.validate(dto.couponCode, subtotal + addonsTotal); if (result.valid && result.coupon) { discountAmount = result.discountAmount; await this.coupons.incrementUsage(result.coupon.id); } }
    const totalAmount = Math.max(0, subtotal + addonsTotal + deliveryFee - discountAmount);
    return this.ordersService.create({ customerId: customer.id, customerName: dto.customerName, customerEmail: dto.customerEmail, customerPhone: dto.customerPhone, recipientName: dto.recipientName, recipientPhone: dto.recipientPhone || dto.customerPhone, deliveryAddress: dto.deliveryAddress, city: dto.city, pincode: dto.pincode, deliveryDate: dto.deliveryDate, deliveryTimeSlot: dto.deliveryTimeSlot, occasion: dto.occasion ?? 'other', presenterRequired: true, presenterNote: dto.presenterNote, specialInstructions: dto.specialInstructions, items, subtotal: Math.round(subtotal * 100) / 100, addonsTotal: Math.round(addonsTotal * 100) / 100, deliveryFee: Math.round(deliveryFee * 100) / 100, discountAmount: Math.round(discountAmount * 100) / 100, totalAmount: Math.round(totalAmount * 100) / 100, status: 'CONFIRMED', paymentStatus: 'PENDING', paymentMethod: undefined }, { id: 'system', name: 'Storefront' });
  }

  private async upsertCustomer(dto: CreateStoreOrderDto) {
    const existing = await this.prisma.customers.findFirst({ where: { phone: dto.customerPhone } });
    if (existing) return this.prisma.customers.update({ where: { id: existing.id }, data: { name: dto.customerName, email: dto.customerEmail || existing.email, city: dto.city || existing.city, pincode: dto.pincode || existing.pincode } });
    return this.prisma.customers.create({ data: { id: generateId('cust'), name: dto.customerName, email: dto.customerEmail, phone: dto.customerPhone, city: dto.city || 'Mumbai', address: dto.deliveryAddress, pincode: dto.pincode, total_orders: 0, total_spent: 0, status: 'ACTIVE' } });
  }

  private json(value: string | null) { try { return value ? JSON.parse(value) : null; } catch { return null; } }
  private package(item: Awaited<ReturnType<PrismaService['packages']['findUniqueOrThrow']>>) { return { id: item.id, slug: item.slug, title: item.title, name: item.name, occasion: item.occasion, occasionLabel: item.occasion_label, category: item.category, tagline: item.tagline, price: Number(item.price), originalPrice: item.original_price === null ? null : Number(item.original_price), compareAtPrice: item.compare_at_price === null ? null : Number(item.compare_at_price), rating: Number(item.rating ?? 5), reviewCount: item.review_count ?? 0, popular: item.popular ?? false, featured: item.featured ?? false, isFeatured: item.is_featured ?? false, isActive: item.is_active ?? false, badge: item.badge, shortDescription: item.short_description, description: item.description, highlights: this.json(item.highlights), inclusions: this.json(item.inclusions), features: this.json(item.features), addons: this.json(item.addons), duration: item.duration, imageTheme: item.image_theme, visualIcon: item.visual_icon, image: item.image }; }
  private toPublicSettings(item: Awaited<ReturnType<PrismaService['store_settings']['findUniqueOrThrow']>>): PublicSettings { return { businessName: item.business_name, brandTagline: item.brand_tagline, helplinePhone: item.helpline_phone, helplineEmail: item.helpline_email, address: item.address, currencySymbol: item.currency_symbol ?? '₹', defaultDeliveryFee: Number(item.default_delivery_fee), freeDeliveryThreshold: Number(item.free_delivery_threshold), allowSameDayBooking: item.allow_same_day_booking ?? false, bookingCutoffTime: item.booking_cutoff_time ?? '18:00' }; }
}
