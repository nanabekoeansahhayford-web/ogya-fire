export type ProductCategory =
  | 'Fire Extinguisher'
  | 'Smoke Detector'
  | 'Fire Blanket'
  | 'Alarm'
  | 'Hose';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Fire Extinguisher',
  'Smoke Detector',
  'Fire Blanket',
  'Alarm',
  'Hose',
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in GHS
  category: ProductCategory;
  imageUrl: string;
  stock: number;
  vendorId: string;
  vendorName: string;
  createdAt?: any;
}

export interface Vendor {
  id: string;
  ownerId: string; // user uid
  shopName: string;
  phone: string;
  location: string;
  description: string;
  logoUrl?: string;
  rating?: number;
  ratingCount?: number;
  isVerified?: boolean;
  deliverySpeed?: string;
  createdAt?: any;
}

export type PaymentMethod = 'MTN MoMo' | 'Telecel Cash' | 'Cash on Delivery';

export type OrderStatus =
  | 'pending'
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface CartItem {
  id: string; // productId
  name: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  quantity: number;
  stock: number;
  vendorId: string;
  vendorName: string;
}

export interface Order {
  id: string;
  userId: string;
  buyerName?: string;
  vendorId?: string;
  items: CartItem[];
  total: number;
  deliveryAddress: string;
  phone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  momoNumber?: string;
  createdAt?: any;
}
