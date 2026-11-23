import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId } from 'src/common/utils/id.util';

export interface ActivityActor {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(
    actor: ActivityActor,
    action: string,
    entityType: string,
    entityId: string | undefined,
    details: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      await this.prisma.activity_logs.create({ data: {
        id: generateId('log'),
        admin_id: actor.id, admin_name: actor.name, admin_email: actor.email,
        action,
        entity_type: entityType, entity_id: entityId ?? null,
        details,
        ip_address: ipAddress ?? '127.0.0.1',
      }});
    } catch (error) {
      this.logger.error(`Failed to insert activity log: ${String(error)}`);
    }
  }

  async list(search?: string) {
    const logs = await this.prisma.activity_logs.findMany({
      where: search ? { OR: [{ admin_name: { contains: search, mode: 'insensitive' } }, { action: { contains: search, mode: 'insensitive' } }, { details: { contains: search, mode: 'insensitive' } }] } : undefined,
      orderBy: { created_at: 'desc' }, take: 100,
    });
    return logs.map((log) => ({ id: log.id, adminId: log.admin_id, adminName: log.admin_name, adminEmail: log.admin_email, action: log.action, entityType: log.entity_type, entityId: log.entity_id, details: log.details, ipAddress: log.ip_address, createdAt: log.created_at }));
  }
}
