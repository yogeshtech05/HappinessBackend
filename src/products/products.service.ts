import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId, randomToken } from 'src/common/utils/id.util';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string, search?: string) {
    const products = await this.prisma.products.findMany({
      where: {
        ...(category && category !== 'ALL' ? { category: { equals: category, mode: 'insensitive' } } : {}),
        ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }] } : {}),
      }, orderBy: { created_at: 'desc' },
    });
    return products.map((product) => this.toRecord(product));
  }

  async create(dto: CreateProductDto): Promise<{ id: string; sku: string }> {
    const sku = dto.sku || `PROD-${randomToken().toUpperCase()}`;
    const id = generateId('prod');
    await this.prisma.products.create({ data: {
      id,
      name: dto.name,
      category: dto.category ?? 'Gifts',
      price: dto.price ?? 499,
      cost_price: dto.costPrice ?? 200,
      sku,
      stock_quantity: dto.stockQuantity ?? 50,
      is_available: dto.isAvailable ?? true,
      description: dto.description ?? '',
      image_url: dto.imageUrl ?? null,
    }});
    return { id, sku };
  }

  async update(id: string, dto: UpdateProductDto): Promise<void> {
    const product = await this.prisma.products.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.prisma.products.update({ where: { id }, data: { name: dto.name, category: dto.category, price: dto.price, cost_price: dto.costPrice, sku: dto.sku, stock_quantity: dto.stockQuantity, is_available: dto.isAvailable, description: dto.description, image_url: dto.imageUrl } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.prisma.products.deleteMany({ where: { id } });
    if (!result.count) {
      throw new NotFoundException('Product not found');
    }
  }

  private toRecord(product: Awaited<ReturnType<PrismaService['products']['findUniqueOrThrow']>>) {
    return { id: product.id, name: product.name, category: product.category, price: Number(product.price), costPrice: product.cost_price === null ? null : Number(product.cost_price), sku: product.sku, stockQuantity: product.stock_quantity ?? 0, isAvailable: product.is_available ?? false, description: product.description, imageUrl: product.image_url, createdAt: product.created_at, updatedAt: product.updated_at };
  }
}
