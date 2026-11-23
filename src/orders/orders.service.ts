import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId, generateOrderNumber } from 'src/common/utils/id.util';
import { OrderStatus } from 'src/common/types/domain';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

export interface OrderInput extends CreateOrderDto { orderNumber?: string }

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, status?: string, page = 1, limit = 10) {
    const where = { ...(status && status !== 'ALL' ? { status } : {}), ...(search ? { OR: [{ order_number: { contains: search, mode: 'insensitive' as const } }, { customer_name: { contains: search, mode: 'insensitive' as const } }, { recipient_name: { contains: search, mode: 'insensitive' as const } }, { customer_phone: { contains: search } }] } : {}) };
    const [total, orders] = await this.prisma.$transaction([this.prisma.orders.count({ where }), this.prisma.orders.findMany({ where, orderBy: { created_at: 'desc' }, skip: (page - 1) * limit, take: limit })]);
    return { data: orders.map((order) => this.toRecord(order)), total, page, limit };
  }

  async findOne(id: string) { const order = await this.prisma.orders.findUnique({ where: { id } }); if (!order) throw new NotFoundException('Order not found'); return this.toRecord(order); }
  async findByOrderNumber(orderNumber: string) { const order = await this.prisma.orders.findUnique({ where: { order_number: orderNumber } }); if (!order) throw new NotFoundException('Order not found'); return this.toRecord(order); }

  async create(input: OrderInput, actor: { id: string; name: string }): Promise<{ id: string; orderNumber: string }> {
    const setting = await this.prisma.store_settings.findUnique({ where: { id: 'main' } });
    const id = generateId('ord'); const orderNumber = input.orderNumber ?? generateOrderNumber(setting?.order_prefix ?? 'HD-'); const now = new Date();
    const timeline = [{ id: 'tl-init', status: input.status ?? 'CONFIRMED', note: 'Order created', updatedBy: actor.name, timestamp: now.toISOString() }];
    await this.prisma.$transaction(async (tx) => {
      await tx.orders.create({ data: { id, order_number: orderNumber, customer_id: input.customerId ?? 'cust-unknown', customer_name: input.customerName, customer_email: input.customerEmail, customer_phone: input.customerPhone, recipient_name: input.recipientName, recipient_phone: input.recipientPhone ?? input.customerPhone, delivery_address: input.deliveryAddress, city: input.city ?? 'Mumbai', pincode: input.pincode ?? '400001', landmark: input.landmark ?? null, delivery_date: input.deliveryDate ?? now.toISOString().slice(0, 10), delivery_time_slot: input.deliveryTimeSlot ?? '', occasion: input.occasion ?? 'birthday', presenter_required: input.presenterRequired ?? true, presenter_note: input.presenterNote ?? null, special_instructions: input.specialInstructions ?? null, items: JSON.stringify(input.items ?? []), subtotal: input.subtotal ?? 0, addons_total: input.addonsTotal ?? 0, delivery_fee: input.deliveryFee ?? 0, discount_amount: input.discountAmount ?? 0, total_amount: input.totalAmount ?? 0, status: input.status ?? 'CONFIRMED', payment_status: input.paymentStatus ?? 'PAID', payment_method: input.paymentMethod ?? 'Razorpay', assigned_staff_id: input.assignedStaffId ?? null, assigned_staff_name: input.assignedStaffName ?? null, internal_notes: input.internalNotes ?? null, timeline: JSON.stringify(timeline) } });
      await tx.deliveries.create({ data: { id: `del-${id}`, order_id: id, order_number: orderNumber, customer_name: input.customerName, customer_phone: input.customerPhone, recipient_name: input.recipientName, recipient_phone: input.recipientPhone ?? input.customerPhone, delivery_address: input.deliveryAddress, city: input.city ?? 'Mumbai', pincode: input.pincode ?? '400001', delivery_date: input.deliveryDate ?? now.toISOString().slice(0, 10), delivery_time_slot: input.deliveryTimeSlot ?? '', assigned_presenter_id: input.assignedStaffId ?? null, assigned_presenter_name: input.assignedStaffName ?? null, status: input.assignedStaffId ? 'ASSIGNED' : 'UNASSIGNED', notes: input.specialInstructions ?? null } });
      if (input.customerId) { const aggregate = await tx.orders.aggregate({ where: { customer_id: input.customerId }, _count: { id: true }, _sum: { total_amount: true } }); await tx.customers.updateMany({ where: { id: input.customerId }, data: { total_orders: aggregate._count.id, total_spent: aggregate._sum.total_amount ?? 0 } }); }
    });
    return { id, orderNumber };
  }

  async update(id: string, dto: UpdateOrderDto, actor: { id: string; name: string }): Promise<void> {
    const order = await this.prisma.orders.findUnique({ where: { id } }); if (!order) throw new NotFoundException('Order not found');
    const status = dto.status ?? order.status; const staffId = dto.assignedStaffId !== undefined ? dto.assignedStaffId : order.assigned_staff_id; const staffName = dto.assignedStaffName !== undefined ? dto.assignedStaffName : order.assigned_staff_name;
    const timeline = this.parse(order.timeline); if (status !== order.status || dto.note) timeline.push({ id: `tl-${Date.now()}`, status, note: dto.note ?? `Status updated to ${status}`, updatedBy: actor.name, timestamp: new Date().toISOString() });
    const deliveryStatus = status === 'OUT_FOR_DELIVERY' ? 'OUT_FOR_DELIVERY' : status === 'DELIVERED' ? 'DELIVERED' : status === 'CANCELLED' ? 'CANCELLED' : staffId ? 'ASSIGNED' : 'UNASSIGNED';
    await this.prisma.$transaction([this.prisma.orders.update({ where: { id }, data: { status, assigned_staff_id: staffId, assigned_staff_name: staffName, internal_notes: dto.internalNotes !== undefined ? dto.internalNotes : order.internal_notes, timeline: JSON.stringify(timeline) } }), this.prisma.deliveries.updateMany({ where: { order_id: id }, data: { status: deliveryStatus, assigned_presenter_id: staffId, assigned_presenter_name: staffName } })]);
  }

  private parse(value: string): Array<Record<string, unknown>> { try { return JSON.parse(value) as Array<Record<string, unknown>>; } catch { return []; } }
  private toRecord(o: Awaited<ReturnType<PrismaService['orders']['findUniqueOrThrow']>>) { return { id: o.id, orderNumber: o.order_number, customerId: o.customer_id, customerName: o.customer_name, customerEmail: o.customer_email, customerPhone: o.customer_phone, recipientName: o.recipient_name, recipientPhone: o.recipient_phone, deliveryAddress: o.delivery_address, city: o.city, pincode: o.pincode, deliveryDate: o.delivery_date, deliveryTimeSlot: o.delivery_time_slot, occasion: o.occasion, items: this.parse(o.items), subtotal: Number(o.subtotal), addonsTotal: Number(o.addons_total ?? 0), deliveryFee: Number(o.delivery_fee ?? 0), discountAmount: Number(o.discount_amount ?? 0), totalAmount: Number(o.total_amount), status: o.status as OrderStatus, paymentStatus: o.payment_status, paymentMethod: o.payment_method, assignedStaffId: o.assigned_staff_id, assignedStaffName: o.assigned_staff_name, internalNotes: o.internal_notes, timeline: this.parse(o.timeline), createdAt: o.created_at, updatedAt: o.updated_at }; }
}
