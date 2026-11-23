import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId } from 'src/common/utils/id.util';
import { UpsertCmsContentDto } from './dto/cms-content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const content = await this.prisma.cms_content.findMany({ orderBy: { updated_at: 'desc' } });
    return content.map((item) => this.toRecord(item));
  }

  async findOne(sectionKey: string) {
    const row = await this.prisma.cms_content.findUnique({ where: { section_key: sectionKey } });
    if (!row) {
      throw new NotFoundException('Content section not found');
    }
    return this.toRecord(row);
  }

  async upsert(
    sectionKey: string,
    dto: UpsertCmsContentDto,
    updatedBy: string,
  ): Promise<{ id: string }> {
    const id = (await this.prisma.cms_content.findUnique({ where: { section_key: sectionKey } }))?.id ?? generateId('cms');
    await this.prisma.cms_content.upsert({
      where: { section_key: sectionKey },
      create: { id, section_key: sectionKey, title: dto.title, subtitle: dto.subtitle ?? '', content: dto.content ?? '', image_url: dto.imageUrl ?? null, metadata: dto.metadata ? JSON.stringify(dto.metadata) : null, updated_by: updatedBy },
      update: { title: dto.title, subtitle: dto.subtitle ?? '', content: dto.content ?? '', image_url: dto.imageUrl ?? null, metadata: dto.metadata ? JSON.stringify(dto.metadata) : null, updated_by: updatedBy, updated_at: new Date() },
    });

    return { id };
  }

  private toRecord(item: Awaited<ReturnType<PrismaService['cms_content']['findUniqueOrThrow']>>) {
    let metadata: Record<string, unknown> | null = null;
    try { metadata = item.metadata ? JSON.parse(item.metadata) as Record<string, unknown> : null; } catch { metadata = null; }
    return { id: item.id, sectionKey: item.section_key, title: item.title, subtitle: item.subtitle, content: item.content, imageUrl: item.image_url, metadata, updatedBy: item.updated_by, updatedAt: item.updated_at };
  }
}
