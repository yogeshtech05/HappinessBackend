import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesReport(range = '30') {
    const days = range === 'ALL' ? null : parseInt(range, 10) || 30;
    const since = days === null ? undefined : new Date(Date.now() - days * 86_400_000);
    const where = { status: { not: 'CANCELLED' }, ...(since ? { created_at: { gte: since } } : {}) };
    const [orders, deliveries] = await Promise.all([this.prisma.orders.findMany({ where, select: { occasion: true, total_amount: true, created_at: true } }), this.prisma.deliveries.findMany({ select: { status: true } })]);
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const trends = Object.values(orders.reduce<Record<string, { date: string; orders: number; revenue: number }>>((result, order) => { const date = order.created_at?.toISOString().slice(0, 10) ?? 'unknown'; const entry = result[date] ?? { date, orders: 0, revenue: 0 }; entry.orders += 1; entry.revenue += Number(order.total_amount); result[date] = entry; return result; }, {})).sort((a, b) => a.date.localeCompare(b.date));
    const occasions = Object.values(orders.reduce<Record<string, { occasion: string; count: number; revenue: number }>>((result, order) => { const occasion = order.occasion.toLowerCase(); const entry = result[occasion] ?? { occasion, count: 0, revenue: 0 }; entry.count += 1; entry.revenue += Number(order.total_amount); result[occasion] = entry; return result; }, {})).sort((a, b) => b.count - a.count).slice(0, 5);
    const delivered = deliveries.filter((delivery) => delivery.status === 'DELIVERED').length;
    return { period: { range: range === 'ALL' ? 'ALL' : days, from: since?.toISOString() ?? 'all-time' }, totals: { orders: orders.length, revenue: totalRevenue, averageOrderValue: orders.length ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0 }, trend: trends, topOccasions: occasions, deliveryMetrics: { delivered, totalDeliveries: deliveries.length, successRate: deliveries.length ? Math.round((delivered / deliveries.length) * 1000) / 10 : 0 } };
  }
}
