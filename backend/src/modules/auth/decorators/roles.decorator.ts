import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator that marks which roles are allowed to access a route.
 * Usage: @Roles('admin') or @Roles('admin', 'user')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
