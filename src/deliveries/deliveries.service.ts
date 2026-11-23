import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from 'src/common/types/domain';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, status?: string) {
    const deliveries = await this.prisma.deliveries.findMany({ where: { ...(status && status !== 'ALL' ? { status } : {}), ...(search ? { OR: [{ order_number: { contains: search, mode: 'insensitive' } }, { recipient_name: { contains: search, mode: 'insensitive' } }, { customer_name: { contains: search, mode: 'insensitive' } }, { assigned_presenter_name: { contains: search, mode: 'insensitive' } }] } : {}) }, orderBy: { delivery_date: 'asc' } });
    return deliveries.map((d) => this.toRecord(d));
  }

  async update(id: string, dto: UpdateDeliveryDto): Promise<void> {
    const delivery = await this.prisma.deliveries.findUnique({ where: { id } });
    if (!delivery) {
      throw new NotFoundException('Delivery record not found');
    }

    const presenterId =
      dto.assignedPresenterId !== undefined
        ? dto.assignedPresenterId
        : delivery.assigned_presenter_id;
    const presenterName =
      dto.assignedPresenterName !== undefined
        ? dto.assignedPresenterName
        : delivery.assigned_presenter_name;
    const status = dto.status ?? delivery.status;
    const notes = dto.notes !== undefined ? dto.notes : delivery.notes;
    const completedAt = status === 'DELIVERED' ? new Date() : delivery.completed_at;

    const orderStatus = this.syncOrderStatus(status);
    await this.prisma.$transaction(async (tx) => {
      await tx.deliveries.update({ where: { id }, data: { assigned_presenter_id: presenterId, assigned_presenter_name: presenterName, status, notes, completed_at: completedAt } });
      if (orderStatus) await tx.orders.update({ where: { id: delivery.order_id }, data: { status: orderStatus, assigned_staff_id: presenterId, assigned_staff_name: presenterName } });
    });
  }

  private syncOrderStatus(deliveryStatus: string): OrderStatus | null {
    switch (deliveryStatus) {
      case 'OUT_FOR_DELIVERY':
        return 'OUT_FOR_DELIVERY';
      case 'DELIVERED':
        return 'DELIVERED';
      case 'FAILED':
        return 'CANCELLED';
      default:
        return null;
    }
  }

  private toRecord(d: Awaited<ReturnType<PrismaService['deliveries']['findUniqueOrThrow']>>) { return { id: d.id, orderId: d.order_id, orderNumber: d.order_number, customerName: d.customer_name, customerPhone: d.customer_phone, recipientName: d.recipient_name, recipientPhone: d.recipient_phone, deliveryAddress: d.delivery_address, city: d.city, pincode: d.pincode, deliveryDate: d.delivery_date, deliveryTimeSlot: d.delivery_time_slot, assignedPresenterId: d.assigned_presenter_id, assignedPresenterName: d.assigned_presenter_name, status: d.status, notes: d.notes, completedAt: d.completed_at, createdAt: d.created_at, updatedAt: d.updated_at }; }
}
