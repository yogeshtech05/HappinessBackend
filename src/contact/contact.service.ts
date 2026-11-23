import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId } from 'src/common/utils/id.util';
import { CreateContactMessageDto, UpdateContactMessageDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateContactMessageDto) {
    const entity = await this.prisma.contact_messages.create({ data: {
      id: generateId('msg'),
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim() || null,
      city: dto.city?.trim() || null,
      occasion: dto.occasion?.trim() || null,
      message: dto.message.trim(),
      status: 'NEW',
    } });
    return this.serialize(entity);
  }

  async findAll(status?: string) {
    const messages = await this.prisma.contact_messages.findMany({
      where: status && status !== 'ALL' ? { status } : {}, orderBy: { created_at: 'desc' },
    });
    return messages.map((message) => this.serialize(message));
  }

  async updateStatus(id: string, dto: UpdateContactMessageDto): Promise<void> {
    try { await this.prisma.contact_messages.update({ where: { id }, data: { status: dto.status } }); }
    catch { throw new NotFoundException('Contact message not found'); }
  }

  async remove(id: string): Promise<void> {
    try { await this.prisma.contact_messages.delete({ where: { id } }); }
    catch { throw new NotFoundException('Contact message not found'); }
  }

  private serialize(message: Awaited<ReturnType<PrismaService['contact_messages']['findUniqueOrThrow']>>) {
    return { id: message.id, name: message.name, email: message.email, phone: message.phone, city: message.city, occasion: message.occasion, message: message.message, status: message.status, createdAt: message.created_at, updatedAt: message.updated_at };
  }
}
