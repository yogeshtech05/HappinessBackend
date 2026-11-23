import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId } from 'src/common/utils/id.util';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, status?: string) {
    const customers = await this.prisma.customers.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(search
          ? { OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { city: { contains: search, mode: 'insensitive' } },
            ] }
          : {}),
      },
      orderBy: { created_at: 'desc' },
    });
    return customers.map((customer) => this.toRecord(customer));
  }

  async findOneWithOrders(id: string) {
    const customer = await this.prisma.customers.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    const orders = await this.prisma.orders.findMany({
      where: { customer_id: id },
      orderBy: { created_at: 'desc' },
    });
    return {
      customer: this.toRecord(customer),
      orders: orders.map((order) => ({
        id: order.id, orderNumber: order.order_number, customerId: order.customer_id,
        status: order.status, totalAmount: Number(order.total_amount),
        deliveryDate: order.delivery_date, createdAt: order.created_at,
      })),
    };
  }

  async create(dto: CreateCustomerDto): Promise<{ id: string }> {
    const existing = await this.prisma.customers.findFirst({
      where: { email: { equals: dto.email, mode: 'insensitive' } },
    });
    if (existing) throw new ConflictException('A customer with this email already exists.');

    const id = generateId('cust');
    await this.prisma.customers.create({
      data: {
        id, name: dto.name, email: dto.email, phone: dto.phone, status: dto.status ?? 'ACTIVE',
        city: dto.city ?? null, address: dto.address ?? null, pincode: dto.pincode ?? null,
        notes: dto.notes ?? null, total_orders: 0, total_spent: 0,
      },
    });
    return { id };
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<void> {
    const customer = await this.prisma.customers.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    await this.prisma.customers.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    const result = await this.prisma.customers.deleteMany({ where: { id } });
    if (!result.count) throw new NotFoundException('Customer not found');
  }

  private toRecord(customer: Awaited<ReturnType<PrismaService['customers']['findUniqueOrThrow']>>) {
    return {
      id: customer.id, name: customer.name, email: customer.email, phone: customer.phone,
      status: customer.status, totalOrders: customer.total_orders ?? 0,
      totalSpent: Number(customer.total_spent ?? 0), city: customer.city,
      address: customer.address, pincode: customer.pincode, notes: customer.notes,
      createdAt: customer.created_at, updatedAt: customer.updated_at,
    };
  }
}
