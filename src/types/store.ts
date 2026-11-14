export type ProductCategory =
  | 'Food'
  | 'Phones'
  | 'Laptops'
  | 'Cars'
  | 'Car Accessories'
  | 'Phone Accessories'
  | 'Fashion'
  | 'Home Items'
  | 'Electronics'
  | 'Everything'
  // Legacy category strings preserved for backwards compatibility
  | 'General Goods'
  | 'Electronics & Gadgets'
  | 'Fashion & Apparel'
  | 'Ghanaian Food'
  | 'Local Delicacies'
  | 'Grill & BBQ'
  | 'Pizza & Fast Food'
  | 'Drinks & Smoothies'
  | (string & {});

export const PRODUCT_CATEGORIES: string[] = [
  'Food',
  'Phones',
  'Laptops',
  'Cars',
  'Car Accessories',
  'Phone Accessories',
  'Fashion',
  'Home Items',
  'Electronics',
  'Everything',
];

/**
 * Normalize legacy or varied category labels to canonical marketplace categories
 */
export function normalizeProductCategory(category?: string): string {
  const raw = (category || '').trim().toLowerCase();
  if (!raw) return 'Everything';
  if (['food', 'ghanaian food', 'local delicacies', 'grill & bbq', 'pizza & fast food', 'drinks & smoothies'].includes(raw)) {
    return 'Food';
  }
  if (['phones', 'phones & tablets', 'phone', 'smartphones'].includes(raw)) {
    return 'Phones';
  }
  if (['laptops', 'laptop', 'computers', 'laptops & computers'].includes(raw)) {
    return 'Laptops';
  }
  if (['cars', 'car', 'vehicles', 'auto'].includes(raw)) {
    return 'Cars';
  }
  if (['car accessories', 'auto parts', 'auto parts & tires'].includes(raw)) {
    return 'Car Accessories';
  }
  if (['phone accessories', 'accessories'].includes(raw)) {
    return 'Phone Accessories';
  }
  if (['fashion', 'fashion & apparel'].includes(raw)) {
    return 'Fashion';
  }
  if (['home items', 'home & furniture', 'furniture', 'home'].includes(raw)) {
    return 'Home Items';
  }
  if (['electronics', 'electronics & gadgets'].includes(raw)) {
    return 'Electronics';
  }
  if (['everything', 'general goods'].includes(raw)) {
    return 'Everything';
  }
  return (category || 'Everything').trim();
}

/**
 * Match a Firestore Product against the top Category filter bar
 * Supports: all, food, phones-tablets/phones, laptops, vehicles/cars, accessories, fashion, electronics, home-furniture
 */
export function matchesProductCategoryFilter(product: Product, filterCategory: string): boolean {
  if (!filterCategory || filterCategory === 'all' || filterCategory === 'everything') return true;
  const filterNorm = filterCategory.trim().toLowerCase();
  const prodCat = (product.category || '').trim().toLowerCase();
  const canonical = normalizeProductCategory(product.category).toLowerCase();
  const prodName = (product.name || '').trim().toLowerCase();

  if (filterNorm === 'food') {
    return canonical === 'food';
  }
  if (filterNorm === 'phones' || filterNorm === 'phones-tablets') {
    return canonical === 'phones' || prodCat === 'phone accessories';
  }
  if (filterNorm === 'laptops') {
    return (
      canonical === 'laptops' ||
      prodCat.includes('laptop') ||
      (canonical === 'electronics' && (prodName.includes('laptop') || prodName.includes('macbook') || prodName.includes('notebook')))
    );
  }
  if (filterNorm === 'cars' || filterNorm === 'vehicles') {
    return canonical === 'cars' || canonical === 'car accessories';
  }
  if (filterNorm === 'accessories') {
    return (
      canonical === 'phone accessories' ||
      canonical === 'car accessories' ||
      prodCat.includes('accessor')
    );
  }
  if (filterNorm === 'fashion') {
    return canonical === 'fashion';
  }
  if (filterNorm === 'electronics') {
    return canonical === 'electronics' || canonical === 'laptops';
  }
  if (filterNorm === 'home-furniture' || filterNorm === 'home items') {
    return canonical === 'home items';
  }
  return prodCat === filterNorm || canonical === filterNorm;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in GHS
  category: ProductCategory;
  imageUrl: string;
  stock: number;
  sellerId?: string; // Firebase Auth UID of product owner
  vendorId: string;
  vendorName: string;
  location?: string;
  sellerLocation?: string;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  isTest?: boolean;
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

export type PaymentMethod = 'MTN MoMo' | 'Telecel Cash' | 'Cash on Delivery' | 'WhatsApp + MoMo';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'On Delivery'
  | 'Delivered'
  | 'pending'
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type CanonicalOrderStep = 'Pending' | 'Confirmed' | 'On Delivery' | 'Delivered';

export function normalizeOrderStatus(status?: string): CanonicalOrderStep | 'Cancelled' {
  const s = (status || '').trim().toLowerCase();
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'delivered') return 'Delivered';
  if (s === 'on delivery' || s === 'shipped') return 'On Delivery';
  if (s === 'confirmed' || s === 'paid' || s === 'processing') return 'Confirmed';
  return 'Pending';
}

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
  buyerId?: string;
  buyerName?: string;
  vendorId?: string;
  sellerId?: string;
  sellerIds?: string[];
  sellerName?: string;
  sellerPhone?: string;
  productId?: string;
  items: CartItem[];
  total: number;
  deliveryAddress: string;
  buyerLocation?: string;
  phone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  momoNumber?: string;
  proofUrl?: string;
  whatsappOrder?: boolean;
  hasReviewed?: boolean;
  reviewId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Review {
  id: string;
  orderId?: string;
  productId?: string;
  listingId?: string;
  sellerId?: string;
  sellerName: string;
  userId: string;
  buyerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt?: any;
}

