import { Request } from 'express';

export interface AuthenticatedUser {
  id?: string;
  userId?: string;
  sub?: string;
  storeId?: string;
  email?: string;
  roles?: string[];
  role?: string;
  type?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  storeId?: string;
  apiKey?: string;
}

export interface TenantRequest extends AuthenticatedRequest {
  storeId: string;
}
