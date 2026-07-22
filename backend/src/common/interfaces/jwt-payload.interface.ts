export interface JwtPayload {
  sub: string;
  email?: string;
  roles?: string[];
  type?: string;
  storeId?: string;
}

export interface SuperAdminJwtPayload extends JwtPayload {
  type: 'SUPER_ADMIN';
  role?: string;
}
