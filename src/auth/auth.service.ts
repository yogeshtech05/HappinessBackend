import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { AppConfig } from 'src/config/configuration';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly activityLog: ActivityLogService,
  ) {}

  hashPassword(plainText: string): string {
    return bcrypt.hashSync(plainText, 10);
  }

  comparePassword(plainText: string, hash: string): boolean {
    return bcrypt.compareSync(plainText, hash);
  }

  signToken(admin: { id: string; email: string; name: string; role_id: string; role_name: string }): string {
    const payload: TokenPayload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      roleId: admin.role_id,
      roleName: admin.role_name,
    };
    return this.jwt.sign(payload);
  }

  async login(
    email: string,
    password: string,
    ipAddress?: string,
  ): Promise<{ admin: AuthenticatedAdmin; token: string }> {
    const user = await this.prisma.admin_users.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (!user || !this.comparePassword(password, user.password_hash)) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is suspended or inactive.');
    }

    const admin = await this.toAuthenticatedAdmin(user);

    await this.prisma.admin_users.update({ where: { id: user.id }, data: { last_login_at: new Date() } });
    await this.activityLog.log(
      { id: user.id, name: user.name, email: user.email },
      'Admin Login',
      'AdminUser',
      user.id,
      `Admin logged in successfully (${user.email})`,
      ipAddress,
    );

    return { admin, token: this.signToken(user) };
  }

  async resolveFromToken(token: string): Promise<AuthenticatedAdmin | null> {
    let payload: TokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TokenPayload>(token);
    } catch {
      return null;
    }
    if (!payload?.sub) return null;

    const user = await this.prisma.admin_users.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== 'ACTIVE') return null;
    return this.toAuthenticatedAdmin(user);
  }

  async getCurrentAdmin(id: string): Promise<AuthenticatedAdmin | null> {
    const user = await this.prisma.admin_users.findUnique({ where: { id } });
    if (!user || user.status !== 'ACTIVE') return null;
    return this.toAuthenticatedAdmin(user);
  }

  getCookieName(): string {
    return this.config.getOrThrow<AppConfig['auth']>('auth').cookieName;
  }

  getCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: string;
    maxAge: number;
  } {
    const auth = this.config.getOrThrow<AppConfig['auth']>('auth');
    const maxAge = this.parseExpiryToMs(auth.jwtExpiresIn);
    return {
      httpOnly: true,
      secure: auth.cookieSecure,
      sameSite: auth.cookieSameSite,
      path: '/',
      maxAge,
    };
  }

  private parseExpiryToMs(expiresIn: string): number {
    const match = /^(\d+)\s*([smhd])?$/.exec(expiresIn.trim());
    if (!match) return 12 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[unit] ?? 1000);
  }

  private async toAuthenticatedAdmin(user: Awaited<ReturnType<PrismaService['admin_users']['findUniqueOrThrow']>>): Promise<AuthenticatedAdmin> {
    const role = await this.prisma.roles.findUnique({ where: { id: user.role_id } });
    let permissions: string[] = [];
    if (role?.permissions) {
      try {
        const parsed: unknown = JSON.parse(role.permissions);
        permissions = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
      } catch {
        permissions = [];
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      status: user.status,
      avatarUrl: user.avatar_url,
      lastLoginAt: user.last_login_at,
      permissions,
    };
  }
}
