import { Injectable, Logger, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req?.headers?.authorization;
    this.logger.debug(`JwtAuthGuard - Incoming Authorization Header: "${authHeader}"`);
    this.logger.debug(`JwtAuthGuard - Cookies: ${JSON.stringify(req?.cookies)}`);
    this.logger.debug(`JwtAuthGuard - Error: ${err}, User: ${JSON.stringify(user)}, Info: ${JSON.stringify(info)}`);

    if (err || !user) {
      const reason = err?.message || info?.message || info || 'No user context in request';
      this.logger.warn(`JwtAuthGuard Authentication Failed: ${reason}`);
      throw err || new UnauthorizedException(reason);
    }
    return user;
  }
}
