export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions?: string[];
  storeId?: string;
  tenantId?: string;
  schemaName?: string;
  isSuperAdmin: boolean;
  isPlatformAdmin: boolean;
  iat?: number;
  exp?: number;
}
