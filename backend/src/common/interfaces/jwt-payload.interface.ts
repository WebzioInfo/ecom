export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  storeId?: string;
  tenantId?: string;
  schemaName?: string;
  allowedStores?: string[];
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
