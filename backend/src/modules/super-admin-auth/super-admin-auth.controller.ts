import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminJwtAuthGuard } from './guards/super-admin-jwt-auth.guard';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';

/**
 * Super Admin Authentication Controller
 *
 * Routes:
 *   POST /api/v1/super-admin/auth/login
 *   POST /api/v1/super-admin/auth/refresh
 *   POST /api/v1/super-admin/auth/logout
 *   GET  /api/v1/super-admin/auth/me
 */
@ApiTags('Super Admin Auth')
@Controller('super-admin/auth')
export class SuperAdminAuthController {
  private readonly logger = new Logger(SuperAdminAuthController.name);

  constructor(private readonly authService: SuperAdminAuthService) {}

  // ─── POST /api/v1/super-admin/auth/login ──────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Super Admin login' })
  async login(@Body() loginDto: SuperAdminLoginDto, @Req() req: ExpressRequest) {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.authService.login(loginDto, clientIp, userAgent);
  }

  // ─── POST /api/v1/super-admin/auth/refresh ────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh Super Admin access token' })
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refresh(body.refresh_token);
  }

  // ─── POST /api/v1/super-admin/auth/logout ────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SuperAdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Super Admin logout (client must clear tokens)' })
  logout() {
    // JWT is stateless — client clears tokens.
    // For stateful invalidation, maintain a token blacklist here.
    return { message: 'Logged out successfully' };
  }

  // ─── GET /api/v1/super-admin/auth/me ─────────────────────────────────────

  @Get('me')
  @UseGuards(SuperAdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated Super Admin profile' })
  async getProfile(@Req() req: ExpressRequest & { user: { userId: string } }) {
    return this.authService.getProfile(req.user.userId);
  }
}
