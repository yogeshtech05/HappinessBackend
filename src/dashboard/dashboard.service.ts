import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalOrders, revenue, pendingOrders, outForDelivery, monthOrders, totalCustomers, activePackages, upcomingDeliveries, recentOrders, statusBreakdown] = await Promise.all([
      this.prisma.orders.count(), this.prisma.orders.aggregate({ where: { NOT: { status: 'CANCELLED' } }, _sum: { total_amount: true } }), this.prisma.orders.count({ where: { status: 'PENDING' } }), this.prisma.orders.count({ where: { status: 'OUT_FOR_DELIVERY' } }), this.prisma.orders.count({ where: { created_at: { gte: monthStart } } }), this.prisma.customers.count(), this.prisma.packages.count({ where: { is_active: true } }), this.prisma.deliveries.count({ where: { status: { in: ['UNASSIGNED', 'ASSIGNED'] }, delivery_date: { gte: now.toISOString().slice(0, 10) } } }), this.prisma.orders.findMany({ orderBy: { created_at: 'desc' }, take: 5 }), this.prisma.orders.groupBy({ by: ['status'], _count: { id: true } }),
    ]);
    return { totalOrders, totalRevenue: Number(revenue._sum.total_amount ?? 0), pendingOrders, outForDelivery, monthOrders, totalCustomers, activePackages, upcomingDeliveries, recentOrders: recentOrders.map((order) => ({ id: order.id, orderNumber: order.order_number, customerName: order.customer_name, totalAmount: Number(order.total_amount), status: order.status, createdAt: order.created_at })), statusBreakdown: statusBreakdown.map((row) => ({ status: row.status, count: row._count.id })) };
  }
}
