import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return (await this.prisma.reviews.findMany({ orderBy: { created_at: 'desc' } })).map((review) => this.toRecord(review));
  }

  async findApproved() {
    return (await this.prisma.reviews.findMany({ where: { status: 'APPROVED' }, orderBy: { created_at: 'desc' } })).map((review) => this.toRecord(review));
  }

  async update(id: string, dto: UpdateReviewDto): Promise<void> {
    const review = await this.prisma.reviews.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.prisma.reviews.update({ where: { id }, data: { status: dto.status, is_featured: dto.isFeatured } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.prisma.reviews.deleteMany({ where: { id } });
    if (!result.count) {
      throw new NotFoundException('Review not found');
    }
  }

  private toRecord(review: Awaited<ReturnType<PrismaService['reviews']['findUniqueOrThrow']>>) {
    return { id: review.id, orderId: review.order_id, packageId: review.package_id, packageName: review.package_name, customerName: review.customer_name, customerEmail: review.customer_email, rating: review.rating, title: review.title, comment: review.comment, status: review.status, isFeatured: review.is_featured ?? false, createdAt: review.created_at };
  }
}
