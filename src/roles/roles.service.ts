import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PERMISSIONS } from 'src/common/constants/permissions';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.roles.findMany({ orderBy: { created_at: 'asc' } });
    return roles.map((role) => ({
      id: role.id, name: role.name, description: role.description, isSystem: role.is_system ?? false,
      permissions: this.parsePermissions(role.permissions), createdAt: role.created_at, updatedAt: role.updated_at,
    }));
  }

  async update(roleId: string, permissions: string[]): Promise<void> {
    const role = await this.prisma.roles.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.is_system && role.name === 'Super Admin') {
      throw new NotFoundException('Permissions for the Super Admin role cannot be modified.');
    }

    const validCodes = new Set(PERMISSIONS.map((permission) => permission.code));
    const sanitized = [...new Set(permissions.filter((code) => validCodes.has(code)))];

    await this.prisma.roles.update({ where: { id: roleId }, data: { permissions: JSON.stringify(sanitized) } });
  }

  private parsePermissions(value: string): string[] {
    try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []; }
    catch { return []; }
  }
}
