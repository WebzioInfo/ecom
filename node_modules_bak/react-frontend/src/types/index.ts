export type Role = 'user' | 'admin';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  roles: Role[];
  isVerified: boolean;
  wishlist?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  images: string[];
  rating: number;
  discount: number;
  featured: boolean;
  isActive: boolean;
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
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  images: string[];
  rating: number;
  discount: number;
  featured: boolean;
  isActive: boolean;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  productId: string;
  quantity: number;
}

export interface CartItem {
  product: Product | string;
  quantity: number;
}

export interface CartState {
  user: string;
  items: CartItem[];
}

export interface OrderItem {
  product: Product | string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number; priceAtPurchase: number }[];
  customerName: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: string;
  returnUrl: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export type WishlistResponse = Product[];
