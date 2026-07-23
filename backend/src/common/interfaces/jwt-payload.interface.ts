export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions?: string[];
  storeId?: string;
  tenantId?: string;
  schemaName?: string;
  iat?: number;
  exp?: number;
}
