export type DealRating =
  | 'great_deal' // Significantly below fair market (>10% below)
  | 'good_deal' // Modestly below fair market (4% to 10% below)
  | 'fair_price' // In line with fair market (-4% to +5%)
  | 'above_market' // Above fair market (6% to 15% above)
  | 'overpriced'; // Significantly above fair market (>15% above)

export interface CategoryBenchmark {
  categoryAveragePrice: number;
  categoryMedianPrice: number;
  sampleSize: number;
  lowestComparablePrice: number;
  highestComparablePrice: number;
}

export interface ComparableListingItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  location: string;
  subcategory: string;
  thumbnail?: string;
  isNegotiable: boolean;
}

export interface MarketPriceEstimate {
  listingId: string;
  dealRating: DealRating;
  dealLabel: string; // e.g. "Great Deal 🔥", "Good Deal 👍", "Fair Market Price ⚖️", "Above Market ⚠️"
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  estimatedPriceMedian: number;
  priceDifference: number; // currentPrice - estimatedPriceMedian (negative = savings for buyer)
  percentageDiff: number; // e.g. -14.2 (meaning 14.2% below market)
  confidence: number; // 0-100 score, e.g. 94
  verdict: string; // 1-2 sentence AI summary
  factors: string[]; // key valuation drivers
  negotiationAdvice?: string; // practical buyer tip
  categoryBenchmark: CategoryBenchmark;
  comparables: ComparableListingItem[];
  isAiPowered: boolean;
  isFallback?: boolean;
  analyzedAt: string;
}

export interface SmartPriceAdvice {
  recommendedPrice: number;
  quickSalePrice: number;
  premiumPrice: number;
  currency: string;
  marketTrend: string;
  demandLevel: 'high' | 'moderate' | 'competitive';
  estimatedDaysToSell: string;
  summary: string;
  reasons: string[];
  proTip: string;
  suggestedNegotiable: boolean;
  isAiPowered: boolean;
  isFallback?: boolean;
  analyzedAt: string;
}

export interface SmartPriceRequest {
  title: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  condition: string;
  region: string;
  location: string;
  description?: string;
  currentInputPrice?: number;
}

