import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateId } from 'src/common/utils/id.util';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { AuthService } from 'src/auth/auth.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findAll(): Promise<unknown[]> {
    const [users, roles] = await Promise.all([
      this.prisma.admin_users.findMany({ orderBy: { created_at: 'desc' } }),
      this.prisma.roles.findMany(),
    ]);
    const rolePermissions = new Map(roles.map((role) => [role.id, this.parsePermissions(role.permissions)]));

    return users.map((user) => this.serialize(user, rolePermissions.get(user.role_id) ?? []));
  }

  async create(dto: CreateAdminUserDto): Promise<{ id: string }> {
    if (
      await this.prisma.admin_users.findFirst({
        where: { email: { equals: dto.email, mode: 'insensitive' } },
      })
    ) {
      throw new ConflictException('Admin user with this email already exists.');
    }

    const role = await this.prisma.roles.findUnique({ where: { id: dto.roleId } });
    const roleName = role?.name ?? 'Staff';

    const id = generateId('admin');
    await this.prisma.admin_users.create({ data: {
      id,
      name: dto.name,
      email: dto.email,
      password_hash: this.authService.hashPassword(dto.password),
      role_id: dto.roleId,
      role_name: roleName,
      status: dto.status ?? 'ACTIVE',
    } });
    return { id };
  }

  async update(id: string, dto: UpdateAdminUserDto): Promise<void> {
    const user = await this.prisma.admin_users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    let roleName = user.role_name;
    let roleId = user.role_id;
    if (dto.roleId) {
      const role = await this.prisma.roles.findUnique({ where: { id: dto.roleId } });
      if (role) {
        roleName = role.name;
        roleId = role.id;
      }
    }

    const patch: Record<string, string> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.roleId !== undefined) {
      patch.role_id = roleId;
      patch.role_name = roleName;
    }
    if (dto.status !== undefined) patch.status = dto.status;
    if (dto.password) patch.password_hash = this.authService.hashPassword(dto.password);

    await this.prisma.admin_users.update({ where: { id: user.id }, data: patch });
  }

  async remove(id: string, actor: AuthenticatedAdmin): Promise<void> {
    if (id === actor.id) {
      throw new BadRequestException('Cannot delete your own active session.');
    }
    await this.prisma.admin_users.delete({ where: { id } });
  }

  private parsePermissions(value: string): string[] {
    try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []; } catch { return []; }
  }

  private serialize(user: Awaited<ReturnType<PrismaService['admin_users']['findUniqueOrThrow']>>, permissions: string[]) {
    return { id: user.id, name: user.name, email: user.email, roleId: user.role_id, roleName: user.role_name, status: user.status, avatarUrl: user.avatar_url, lastLoginAt: user.last_login_at, createdAt: user.created_at, updatedAt: user.updated_at, permissions };
  }
}
