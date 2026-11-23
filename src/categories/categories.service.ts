import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  icon: string | null;
  packageCount: number;
  gradient: string | null;
  accentColor: string | null;
  createdAt: Date | null;
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryRecord[]> {
    const categories = await this.prisma.categories.findMany({ orderBy: { created_at: 'asc' } });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      tagline: category.tagline,
      icon: category.icon,
      packageCount: category.package_count ?? 0,
      gradient: category.gradient,
      accentColor: category.accent_color,
      createdAt: category.created_at,
    }));
  }
}
