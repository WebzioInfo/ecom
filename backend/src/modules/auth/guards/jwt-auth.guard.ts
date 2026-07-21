import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const req = context.switchToHttp().getRequest<{ url?: string }>();

    if (err || !user) {
      // Detailed internal logging — never sent to client
      if (info instanceof TokenExpiredError) {
        this.logger.warn(`[AUTH] Token expired for request: ${req?.url}`);
        throw new UnauthorizedException('Token has expired');
      }

      if (info instanceof JsonWebTokenError) {
        this.logger.warn(
          `[AUTH] Invalid JWT signature/format for request: ${req?.url} — ${(info as JsonWebTokenError).message}`,
        );
        throw new UnauthorizedException('Invalid token');
      }

      if (info instanceof Error && (info as Error).message === 'No auth token') {
        this.logger.warn(`[AUTH] Missing Authorization header for request: ${req?.url}`);
        throw new UnauthorizedException('Authorization token is required');
      }

      if (err instanceof UnauthorizedException) {
        this.logger.warn(
          `[AUTH] User not found or inactive for request: ${req?.url}`,
        );
        throw err;
      }

      this.logger.warn(
        `[AUTH] Unauthorized access attempt: ${req?.url} — info: ${JSON.stringify(info)}`,
      );
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
