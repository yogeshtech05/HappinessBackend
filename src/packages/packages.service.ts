import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId, slugify } from 'src/common/utils/id.util';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, occasion?: string) {
    const packages = await this.prisma.packages.findMany({
      where: { ...(occasion && occasion !== 'ALL' ? { occasion } : {}), ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }, { category: { contains: search, mode: 'insensitive' } }] } : {}) },
      orderBy: { created_at: 'desc' },
    });
    return packages.map((pkg) => this.toRecord(pkg));
  }

  async findActive(occasion?: string) {
    const packages = await this.prisma.packages.findMany({ where: { is_active: true, ...(occasion && occasion !== 'ALL' ? { occasion } : {}) }, orderBy: { created_at: 'desc' } });
    return packages.map((pkg) => this.toRecord(pkg));
  }

  async findOne(idOrSlug: string) {
    const pkg = await this.prisma.packages.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } });
    if (!pkg) throw new NotFoundException('Package not found');
    return this.toRecord(pkg);
  }

  async create(dto: CreatePackageDto): Promise<{ id: string; slug: string }> {
    const id = generateId('pkg'); const slug = dto.slug || slugify(dto.title);
    await this.prisma.packages.create({ data: this.toData({ ...dto, id, slug }, true) as never });
    return { id, slug };
  }

  async update(id: string, dto: UpdatePackageDto): Promise<void> {
    if (!await this.prisma.packages.findUnique({ where: { id } })) throw new NotFoundException('Package not found');
    await this.prisma.packages.update({ where: { id }, data: this.toData(dto, false) as never });
  }

  async remove(id: string): Promise<void> {
    if (!(await this.prisma.packages.deleteMany({ where: { id } })).count) throw new NotFoundException('Package not found');
  }

  private toData(dto: Partial<CreatePackageDto> & { id?: string; slug?: string }, create: boolean) {
    const encode = (value: unknown) => JSON.stringify(value ?? []);
    return {
      ...(create ? { id: dto.id!, slug: dto.slug! } : {}), title: dto.title,
      ...(create ? { name: dto.name ?? dto.title, occasion: dto.occasion ?? 'birthday', occasion_label: dto.occasionLabel ?? this.occasionLabel(dto.occasion), category: dto.category ?? 'Milestone Celebration', tagline: dto.tagline ?? '', price: dto.price ?? 999, original_price: dto.originalPrice ?? dto.price ?? 999, compare_at_price: dto.compareAtPrice ?? dto.price ?? 999, rating: dto.rating ?? 5, review_count: dto.reviewCount ?? 0, popular: dto.popular ?? false, featured: dto.featured ?? false, is_featured: dto.isFeatured ?? false, is_active: dto.isActive ?? true, badge: dto.badge ?? '', short_description: dto.shortDescription ?? '', description: dto.description ?? '', highlights: encode(dto.highlights), inclusions: encode(dto.inclusions), features: encode(dto.features), addons: encode(dto.addons), duration: dto.duration ?? '30-45 Mins', image_theme: dto.imageTheme ?? 'rose', visual_icon: dto.visualIcon ?? 'Gift', image: dto.image ?? '/surprises/birthday.png' } : { name: dto.name, occasion: dto.occasion, occasion_label: dto.occasionLabel, category: dto.category, tagline: dto.tagline, price: dto.price, original_price: dto.originalPrice, compare_at_price: dto.compareAtPrice, rating: dto.rating, review_count: dto.reviewCount, popular: dto.popular, featured: dto.featured, is_featured: dto.isFeatured, is_active: dto.isActive, badge: dto.badge, short_description: dto.shortDescription, description: dto.description, ...(dto.highlights !== undefined ? { highlights: encode(dto.highlights) } : {}), ...(dto.inclusions !== undefined ? { inclusions: encode(dto.inclusions) } : {}), ...(dto.features !== undefined ? { features: encode(dto.features) } : {}), ...(dto.addons !== undefined ? { addons: encode(dto.addons) } : {}), duration: dto.duration, image_theme: dto.imageTheme, visual_icon: dto.visualIcon, image: dto.image }),
    };
  }

  private toRecord(pkg: Awaited<ReturnType<PrismaService['packages']['findUniqueOrThrow']>>) {
    const parse = <T>(value: string): T => { try { return JSON.parse(value) as T; } catch { return [] as T; } };
    return { id: pkg.id, slug: pkg.slug, title: pkg.title, name: pkg.name, occasion: pkg.occasion, occasionLabel: pkg.occasion_label, category: pkg.category, tagline: pkg.tagline, price: Number(pkg.price), originalPrice: pkg.original_price === null ? null : Number(pkg.original_price), compareAtPrice: pkg.compare_at_price === null ? null : Number(pkg.compare_at_price), rating: Number(pkg.rating ?? 0), reviewCount: pkg.review_count ?? 0, popular: pkg.popular ?? false, featured: pkg.featured ?? false, isFeatured: pkg.is_featured ?? false, isActive: pkg.is_active ?? false, badge: pkg.badge, shortDescription: pkg.short_description, description: pkg.description, highlights: parse<string[]>(pkg.highlights), inclusions: parse<string[]>(pkg.inclusions), features: parse(pkg.features), addons: parse(pkg.addons), duration: pkg.duration, imageTheme: pkg.image_theme, visualIcon: pkg.visual_icon, image: pkg.image, createdAt: pkg.created_at, updatedAt: pkg.updated_at };
  }

  private occasionLabel(occasion?: string): string { return ({ birthday: 'Birthday', anniversary: 'Anniversary', parents: 'For Parents', romantic: 'Romantic', congratulations: 'Congratulations', festivals: 'Festivals' }[occasion ?? 'birthday'] ?? 'Birthday'); }
}
