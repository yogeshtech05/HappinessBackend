import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate an admin user and issue a session cookie' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ip =
      (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      request.ip;
    const { admin, token } = await this.authService.login(dto.email, dto.password, ip);
    response.cookie(this.authService.getCookieName(), token, this.authService.getCookieOptions());
    return { data: admin };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear the admin session cookie' })
  async logout(
    @CurrentUser() user: AuthenticatedAdmin | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (user) {
      await this.activityLog.log(
        user,
        'Admin Logout',
        'AdminUser',
        user.id,
        `Admin logged out (${user.email})`,
      );
    }
    response.clearCookie(this.authService.getCookieName(), {
      ...this.authService.getCookieOptions(),
      maxAge: undefined,
    });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the currently authenticated admin user' })
  me(@CurrentUser() user: AuthenticatedAdmin) {
    return { data: user };
  }
}
