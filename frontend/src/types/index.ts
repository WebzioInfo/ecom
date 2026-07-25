export type Role = 'admin' | 'user';

export interface UserProfile {
  _id: string;
  id?: string;
  name: string;
  email: string;
  roles: Role[];
  role?: string;
  permissions?: string[];
  accessibleModules?: string[];
  isSuperAdmin?: boolean;
  storeId?: string;
  isVerified?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  storeSlug?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user?: UserProfile;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export type WishlistResponse = Product[];

export interface ProductVariant {
  sku: string;
  title: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
  barcode?: string;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface Product {
  _id: string;
  storeId?: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  barcode?: string;
  productType?: 'simple' | 'variable' | 'digital' | 'subscription' | 'bundle';
  category: string;
  brand: string;
  images: string[];
  variants?: ProductVariant[];
  seo?: ProductSEO;
  rating: number;
  discount: number;
  featured: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  inStock?: boolean;
}

export interface ProductFilters {
  categories: string[];
  brands: string[];
}

export interface CreateProductPayload {
  storeId?: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  barcode?: string;
  productType?: string;
  category: string;
  brand: string;
  images: string[];
  variants?: ProductVariant[];
  rating?: number;
  discount?: number;
  featured?: boolean;
  isActive?: boolean;
}

export interface OrderItem {
  product: Product | string;
  title?: string;
  sku?: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface OrderTimelineEvent {
  status: string;
  description: string;
  timestamp: string;
}

export interface Order {
  _id: string;
  storeId?: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  trackingNumber?: string;
  carrier?: string;
  timeline?: OrderTimelineEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  storeId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
}
