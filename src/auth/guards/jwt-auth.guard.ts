import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { AppConfig } from 'src/config/configuration';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (token) {
      const admin = await this.authService.resolveFromToken(token);
      if (admin) {
        (request as Request & { user?: unknown }).user = admin;
        return true;
      }
    }

    if (isPublic) {
      return true;
    }

    throw new UnauthorizedException('Unauthorized access. Please log in.');
  }

  private extractToken(request: Request): string | null {
    const cookieName = this.config.getOrThrow<AppConfig['auth']>('auth').cookieName;
    const cookieToken = request.cookies?.[cookieName];
    if (typeof cookieToken === 'string' && cookieToken.length > 0) {
      return cookieToken;
    }

    const header = request.headers.authorization;
    if (header && header.toLowerCase().startsWith('bearer ')) {
      return header.slice(7).trim();
    }

    return null;
  }
}
