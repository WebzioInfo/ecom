import { Request } from 'express';

export interface AuthenticatedUser {
  id?: string;
  userId?: string;
  sub?: string;
  storeId?: string;
  tenantId?: string;
  email?: string;
  roles?: string[];
  role?: string;
  type?: string;
  isSuperAdmin?: boolean;
  isPlatformAdmin?: boolean;
  permissions?: string[];
  schemaName?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  storeId?: string;
  tenantId?: string;
  apiKey?: string;
}

export interface TenantRequest extends AuthenticatedRequest {
  storeId: string;
}
