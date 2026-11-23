import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId } from 'src/common/utils/id.util';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const notifications = await this.prisma.notifications.findMany({ orderBy: { created_at: 'desc' } });
    return notifications.map((item) => ({ id: item.id, title: item.title, body: item.body, targetAudience: item.target_audience, recipientId: item.recipient_id, sentBy: item.sent_by, status: item.status, sentAt: item.sent_at, createdAt: item.created_at }));
  }

  async create(dto: CreateNotificationDto, sentBy: string): Promise<{ id: string }> {
    const id = generateId('notif');
    await this.prisma.notifications.create({ data: {
      id,
      title: dto.title,
      body: dto.body,
      target_audience: dto.targetAudience ?? 'ALL_CUSTOMERS', recipient_id: dto.recipientId ?? null, sent_by: sentBy,
      status: 'SENT',
      sent_at: new Date(),
    }});
    return { id };
  }
}
