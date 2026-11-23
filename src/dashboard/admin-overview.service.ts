import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date().toISOString().slice(0, 10);
    const [totalCustomers, orders, activePackages, pendingDeliveries, recentOrders, upcomingDeliveries, recentCustomers] = await Promise.all([
      this.prisma.customers.count(), this.prisma.orders.findMany({ select: { status: true, total_amount: true, created_at: true } }), this.prisma.packages.count({ where: { is_active: true } }), this.prisma.deliveries.count({ where: { status: { in: ['UNASSIGNED', 'ASSIGNED', 'PREPARING', 'OUT_FOR_DELIVERY'] } } }), this.prisma.orders.findMany({ select: { id: true, order_number: true, customer_name: true, recipient_name: true, total_amount: true, status: true, delivery_date: true, delivery_time_slot: true, created_at: true }, orderBy: { created_at: 'desc' }, take: 5 }), this.prisma.deliveries.findMany({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } }, select: { id: true, order_number: true, customer_name: true, recipient_name: true, delivery_address: true, delivery_date: true, delivery_time_slot: true, status: true, assigned_presenter_name: true }, orderBy: { delivery_date: 'asc' }, take: 5 }), this.prisma.customers.findMany({ select: { id: true, name: true, email: true, phone: true, city: true, total_orders: true, total_spent: true, created_at: true }, orderBy: { created_at: 'desc' }, take: 5 }),
    ]);
    const count = (status: string) => orders.filter((order) => order.status === status).length;
    const pendingOrders = count('PENDING'); const confirmedOrders = count('CONFIRMED'); const preparingOrders = count('PREPARING'); const outForDeliveryOrders = count('OUT_FOR_DELIVERY'); const deliveredOrders = count('DELIVERED'); const cancelledOrders = count('CANCELLED');
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0); const todayOrders = orders.filter((order) => order.created_at?.toISOString().slice(0, 10) === today); const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    return { metrics: { totalCustomers, totalOrders: orders.length, todayOrders: todayOrders.length, pendingOrders, confirmedOrders, preparingOrders, outForDeliveryOrders, deliveredOrders, cancelledOrders, totalRevenue, todayRevenue, upcomingSurprises: pendingOrders + confirmedOrders + preparingOrders, pendingDeliveries, activePackages }, recentOrders: recentOrders.map((order) => ({ ...order, total_amount: Number(order.total_amount) })), upcomingDeliveries, recentCustomers: recentCustomers.map((customer) => ({ ...customer, total_spent: Number(customer.total_spent ?? 0) })), statusDistribution: [{ name: 'Pending', value: pendingOrders, color: '#f59e0b' }, { name: 'Confirmed', value: confirmedOrders, color: '#3b82f6' }, { name: 'Preparing', value: preparingOrders, color: '#6366f1' }, { name: 'Out for Delivery', value: outForDeliveryOrders, color: '#ec4899' }, { name: 'Delivered', value: deliveredOrders, color: '#10b981' }, { name: 'Cancelled', value: cancelledOrders, color: '#ef4444' }] };
  }

  async getReport() {
    const [orders, packages, deliveryRows] = await Promise.all([this.prisma.orders.findMany({ where: { NOT: { status: 'CANCELLED' } }, select: { occasion: true, total_amount: true, discount_amount: true } }), this.prisma.packages.findMany({ select: { title: true, occasion: true, price: true, rating: true, review_count: true }, orderBy: [{ review_count: 'desc' }, { rating: 'desc' }], take: 5 }), this.prisma.deliveries.findMany({ select: { status: true } })]);
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total_amount), 0); const totalDiscounts = orders.reduce((sum, order) => sum + Number(order.discount_amount ?? 0), 0); const occasions = Object.values(orders.reduce<Record<string, { occasion: string; count: number; total_revenue: number }>>((result, order) => { const entry = result[order.occasion] ?? { occasion: order.occasion, count: 0, total_revenue: 0 }; entry.count += 1; entry.total_revenue += Number(order.total_amount); result[order.occasion] = entry; return result; }, {}));
    const totalDeliveries = deliveryRows.length; const completed = deliveryRows.filter((row) => row.status === 'DELIVERED').length; const failed = deliveryRows.filter((row) => row.status === 'FAILED').length; const active = deliveryRows.filter((row) => ['UNASSIGNED', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(row.status)).length;
    return { summary: { totalOrders: orders.length, totalSales, avgOrderValue: orders.length ? totalSales / orders.length : 0, totalDiscounts }, occasions, topPackages: packages.map((item) => ({ ...item, price: Number(item.price), rating: Number(item.rating ?? 0) })), deliveries: { total_deliveries: totalDeliveries, completed, failed, active } };
  }
}
