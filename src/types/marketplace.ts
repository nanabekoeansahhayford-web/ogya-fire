export type CategoryId =
  | 'vehicles'
  | 'phones-tablets'
  | 'electronics'
  | 'property'
  | 'fashion'
  | 'home-furniture'
  | 'beauty-care'
  | 'food'
  | 'jobs-services'
  | 'services'
  | 'jobs'
  | 'food-agriculture'
  | 'repair-construction'
  | 'commercial-equipment'
  | 'leisure-activities'
  | 'babies-kids'
  | 'animals-pets'
  | 'seeking-work-cvs'
  | 'business-industry';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  iconName: string;
  shortDesc: string;
  subcategories: string[];
}

export type ItemCondition =
  | 'Brand New'
  | 'Like New / Mint'
  | 'Refurbished'
  | 'Fairly Used'
  | 'Not Applicable';

export type AccountType =
  | 'buyer'
  | 'seller'
  | 'individual'
  | 'business'
  | 'jobseeker'
  | 'recruiter'
  | 'vendor'
  | 'customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  accountType: AccountType;
  userRole?: 'buyer' | 'seller' | 'vendor' | 'customer';
  role?: 'customer' | 'vendor' | 'buyer' | 'seller';
  businessName?: string;
  profession?: string;
  experience?: string;
  businessCategory?: string;
  region: string;
  city?: string;
  bio?: string;
  isVerified: boolean;
  memberSince: string;
  avatarUrl?: string;
  password?: string;
  // Ghana Card Verification & Paid Verified Pro Subscription (100 GHS/month)
  ghanaCardNumber?: string;
  ghanaCardPhotoUrl?: string;
  ghanaCardBackUrl?: string;
  ghanaCardStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  ghanaCardRejectReason?: string;
  ghanaCardSubmittedAt?: string;
  ghanaCardVerifiedAt?: string;
  isSubscribedVerified?: boolean;
  subscriptionPlan?: string;
  verifiedExpiresAt?: string;
  verifiedAmount?: number;
  // MoMo Verification (Anti-scam KYC in Ghana)
  momoVerified?: boolean;
  momoStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  momoName?: string;
  momoNumber?: string;
  momoNetwork?: 'MTN' | 'Telecel' | 'AirtelTigo' | 'AT';
  momoSubmittedAt?: string;
  momoVerifiedAt?: string;
  salesCount?: number;
  isTrustedSeller?: boolean;
}

export type SellerBadgeId =
  | 'top-rated'
  | 'verified-pro'
  | 'fast-responder'
  | 'trusted-merchant'
  | 'rising-star';

export interface SellerBadge {
  id: SellerBadgeId;
  label: string;
  shortLabel: string;
  description: string;
  criteria: string;
  iconName: 'Award' | 'ShieldCheck' | 'Zap' | 'CheckCircle2' | 'Sparkles';
}

export interface SellerInfo {
  name: string;
  isVerified: boolean;
  ghanaCardVerified?: boolean;
  isSubscribedVerified?: boolean;
  verifiedPlan?: string;
  memberSince: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  location: string;
  badges?: SellerBadgeId[];
  reputationScore?: number;
  responseRate?: number;
  averageResponseTime?: string;
  whatsappClicks?: number;
  // Trust & MoMo Verification
  momoVerified?: boolean;
  momoStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  momoName?: string;
  momoNumber?: string;
  momoNetwork?: 'MTN' | 'Telecel' | 'AirtelTigo';
  salesCount?: number;
  isTrustedSeller?: boolean;
}

export interface PriceHistoryPoint {
  date: string; // Formatted date e.g. "Aug 12" or "2024-08-12"
  price: number;
  label?: string; // Optional event note e.g. "Initial List Price", "Price Drop", "Current Price"
}

export interface Listing {
  id: string;
  userId?: string;
  title: string;
  priceHistory?: PriceHistoryPoint[];
  categoryId: CategoryId;
  categoryName: string;
  subcategory: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  location: string;
  region: string;
  condition: ItemCondition;
  description: string;
  images: string[];
  seller: SellerInfo;
  postedAt: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
  isPromoted?: boolean;
  promotedUntil?: string;
  boostPlan?: string;
  viewsCount: number;
  likesCount: number;
  whatsappClicks?: number;
  status?: 'active' | 'sold' | 'expired';
  isSold?: boolean;
  soldAt?: string;
  isHotDeal?: boolean;
  originalPrice?: number;
  discountPercent?: number;
  isBigItem?: boolean;
  attributes?: Record<string, string>;
  // For Seeking Work - CVs
  cvDetails?: {
    candidateName: string;
    profession: string;
    yearsExperience: string;
    education: string;
    skills: string[];
    availability: string;
    expectedSalary: string;
    portfolioUrl?: string;
  };
  // For Jobs
  jobDetails?: {
    companyName: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
    salaryPeriod: 'per month' | 'per year' | 'per project';
    deadline?: string;
    requirements: string[];
  };
}

export interface ChatMessage {
  id: string;
  listingId: string;
  sender: 'buyer' | 'seller';
  text: string;
  offerAmount?: number;
  timestamp: string;
}

export interface FilterState {
  searchQuery: string;
  category: CategoryId | 'all';
  subcategory: string;
  region: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  onlyVerified: boolean;
  badgeFilter?: SellerBadgeId | 'all';
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular' | 'top-rated';
}

export interface WantedItem {
  id: string;
  item: string;
  budget: number;
  location: string;
  whatsapp: string;
  notes?: string;
  createdAt?: string;
  createdAtFormatted?: string;
  status?: 'active' | 'fulfilled';
}
