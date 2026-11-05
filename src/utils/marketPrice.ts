import { Listing } from '../types/marketplace';
import {
  MarketPriceEstimate,
  DealRating,
  CategoryBenchmark,
  ComparableListingItem,
  SmartPriceAdvice,
  SmartPriceRequest,
} from '../types/marketPrice';

const ESTIMATE_CACHE = new Map<string, { timestamp: number; data: MarketPriceEstimate }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

/**
 * Filter and score similar listings in the same category/subcategory
 */
export function findComparableListings(target: Listing, allListings: Listing[]): Listing[] {
  // Exclude current listing and items with zero or negative price
  const candidates = allListings.filter(
    (l) => l.id !== target.id && typeof l.price === 'number' && l.price > 0
  );

  // 1. Strict match: same category AND same subcategory
  const sameSubcat = candidates.filter(
    (l) => l.categoryId === target.categoryId && l.subcategory === target.subcategory
  );

  if (sameSubcat.length >= 2) {
    // Sort by price proximity to target to find the most relevant items
    return [...sameSubcat]
      .sort((a, b) => Math.abs(a.price - target.price) - Math.abs(b.price - target.price))
      .slice(0, 6);
  }

  // 2. Broad match: same category
  const sameCat = candidates.filter((l) => l.categoryId === target.categoryId);
  if (sameCat.length > 0) {
    return [...sameCat]
      .sort((a, b) => Math.abs(a.price - target.price) - Math.abs(b.price - target.price))
      .slice(0, 6);
  }

  // Fallback: return candidates with closest prices in general
  return candidates.slice(0, 4);
}

/**
 * Compute condition adjustment multiplier
 */
function getConditionMultiplier(condition: string): number {
  switch (condition) {
    case 'Brand New':
      return 1.15;
    case 'Like New / Mint':
      return 1.05;
    case 'Refurbished':
      return 0.92;
    case 'Fairly Used':
      return 0.8;
    default:
      return 1.0;
  }
}

/**
 * Compute local statistical benchmarks from comparable items
 */
export function computeCategoryBenchmark(
  target: Listing,
  comparables: Listing[]
): CategoryBenchmark {
  const prices = comparables.map((c) => c.price).filter((p) => p > 0);

  if (prices.length === 0) {
    return {
      categoryAveragePrice: target.price,
      categoryMedianPrice: target.price,
      sampleSize: 1,
      lowestComparablePrice: target.price,
      highestComparablePrice: target.price,
    };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, p) => acc + p, 0);
  const avg = Math.round(sum / sorted.length);

  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

  return {
    categoryAveragePrice: avg,
    categoryMedianPrice: median,
    sampleSize: sorted.length,
    lowestComparablePrice: sorted[0],
    highestComparablePrice: sorted[sorted.length - 1],
  };
}

/**
 * Deterministic local algorithmic estimation (runs instantly on client as baseline)
 */
export function calculateLocalMarketEstimate(
  target: Listing,
  allListings: Listing[]
): MarketPriceEstimate {
  const comparables = findComparableListings(target, allListings);
  const benchmark = computeCategoryBenchmark(target, comparables);

  // Condition weighting
  const targetMultiplier = getConditionMultiplier(target.condition);

  // Base fair price anchor: mix of median comparable price and target price adjusted by condition
  let estimatedMedian = benchmark.categoryMedianPrice;

  // If target price is drastically different (e.g. Range Rover vs sedan in vehicles),
  // anchor more around target price with historical trend
  const ratio = target.price / (benchmark.categoryMedianPrice || 1);
  if (ratio > 2.5 || ratio < 0.4) {
    // If target has priceHistory, compute historical mean
    if (target.priceHistory && target.priceHistory.length > 1) {
      const histPrices = target.priceHistory.map((h) => h.price);
      const histAvg = Math.round(histPrices.reduce((a, b) => a + b, 0) / histPrices.length);
      estimatedMedian = Math.round(histAvg * 0.98);
    } else {
      // Estimate based on target price adjusted by condition
      estimatedMedian = Math.round(target.price * (1 / targetMultiplier));
    }
  } else {
    estimatedMedian = Math.round(estimatedMedian * targetMultiplier);
  }

  // Define fair market spread: +/- 7% to 12%
  const spreadPercent = target.isNegotiable ? 0.1 : 0.08;
  const estimatedMin = Math.round(estimatedMedian * (1 - spreadPercent));
  const estimatedMax = Math.round(estimatedMedian * (1 + spreadPercent));

  const priceDiff = target.price - estimatedMedian;
  const percentageDiff = Math.round(((target.price - estimatedMedian) / estimatedMedian) * 1000) / 10;

  // Determine deal rating
  let dealRating: DealRating = 'fair_price';
  let dealLabel = 'Fair Market Price ⚖️';

  if (percentageDiff <= -10) {
    dealRating = 'great_deal';
    dealLabel = 'Great Deal 🔥';
  } else if (percentageDiff < -3) {
    dealRating = 'good_deal';
    dealLabel = 'Good Value 👍';
  } else if (percentageDiff <= 5) {
    dealRating = 'fair_price';
    dealLabel = 'Fair Market Price ⚖️';
  } else if (percentageDiff <= 15) {
    dealRating = 'above_market';
    dealLabel = 'Above Market ⚠️';
  } else {
    dealRating = 'overpriced';
    dealLabel = 'Premium Ask 🏷️';
  }

  // Factors
  const factors: string[] = [];
  factors.push(`Condition '${target.condition}' benchmarks against ${comparables.length} similar items in ${target.subcategory}.`);
  if (target.isNegotiable) {
    factors.push('Seller accepts negotiations, offering potential additional savings on final settlement.');
  }
  if (target.attributes && Object.keys(target.attributes).length > 0) {
    const keyAttrs = Object.entries(target.attributes)
      .slice(0, 2)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    factors.push(`Key specifications evaluated: ${keyAttrs}.`);
  }
  factors.push(`Regional pricing aligned with current market demand in ${target.region.split('(')[0].trim()}.`);

  let verdict = '';
  if (dealRating === 'great_deal') {
    verdict = `Priced ${Math.abs(percentageDiff)}% below estimated market value. Outstanding opportunity for buyers looking in ${target.subcategory}.`;
  } else if (dealRating === 'good_deal') {
    verdict = `Competitively priced at ${Math.abs(percentageDiff)}% under standard market rates with solid value.`;
  } else if (dealRating === 'fair_price') {
    verdict = `Accurately priced within normal market distribution for its condition and specifications.`;
  } else {
    verdict = `Asking price is ${percentageDiff}% above typical category averages. Consider negotiating with seller.`;
  }

  const negotiationAdvice = target.isNegotiable
    ? `Since the seller has marked this listing as negotiable, a polite opening counter-offer around ${target.currency} ${estimatedMin.toLocaleString()} is well-supported by market comparables.`
    : `The seller has set a firm price. Given the market benchmark of ${target.currency} ${estimatedMedian.toLocaleString()}, verify all inclusions before purchase.`;

  const mappedComparables: ComparableListingItem[] = comparables.map((c) => ({
    id: c.id,
    title: c.title,
    price: c.price,
    currency: c.currency,
    condition: c.condition,
    location: c.location,
    subcategory: c.subcategory,
    thumbnail: c.images?.[0],
    isNegotiable: Boolean(c.isNegotiable),
  }));

  return {
    listingId: target.id,
    dealRating,
    dealLabel,
    estimatedPriceMin: estimatedMin,
    estimatedPriceMax: estimatedMax,
    estimatedPriceMedian: estimatedMedian,
    priceDifference: priceDiff,
    percentageDiff,
    confidence: Math.min(95, 75 + Math.min(comparables.length * 4, 20)),
    verdict,
    factors,
    negotiationAdvice,
    categoryBenchmark: benchmark,
    comparables: mappedComparables,
    isAiPowered: false,
    isFallback: false,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Fetch AI-powered market price valuation from server-side Gemini API route
 */
export async function fetchAiMarketPriceEstimate(
  target: Listing,
  allListings: Listing[],
  forceRefresh = false
): Promise<MarketPriceEstimate> {
  const cacheKey = `${target.id}_${target.price}`;

  if (!forceRefresh) {
    const cached = ESTIMATE_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Pre-calculate baseline local estimate so we always have complete data
  const fallback = calculateLocalMarketEstimate(target, allListings);

  try {
    const comparables = findComparableListings(target, allListings);

    const payload = {
      listing: {
        id: target.id,
        title: target.title,
        price: target.price,
        currency: target.currency,
        categoryId: target.categoryId,
        categoryName: target.categoryName,
        subcategory: target.subcategory,
        condition: target.condition,
        location: target.location,
        region: target.region,
        isNegotiable: target.isNegotiable,
        attributes: target.attributes || {},
        priceHistory: target.priceHistory || [],
      },
      similarItems: comparables.map((c) => ({
        id: c.id,
        title: c.title,
        price: c.price,
        currency: c.currency,
        condition: c.condition,
        location: c.location,
        subcategory: c.subcategory,
        attributes: c.attributes || {},
      })),
      benchmark: fallback.categoryBenchmark,
    };

    const response = await fetch('/api/market-price-estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(22000),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const aiData = await response.json();

    if (aiData && aiData.dealRating && typeof aiData.estimatedPriceMedian === 'number') {
      const priceDifference = target.price - aiData.estimatedPriceMedian;
      const percentageDiff =
        Math.round(((target.price - aiData.estimatedPriceMedian) / aiData.estimatedPriceMedian) * 1000) / 10;

      const result: MarketPriceEstimate = {
        listingId: target.id,
        dealRating: aiData.dealRating as DealRating,
        dealLabel: aiData.dealLabel || fallback.dealLabel,
        estimatedPriceMin: Number(aiData.estimatedPriceMin) || fallback.estimatedPriceMin,
        estimatedPriceMax: Number(aiData.estimatedPriceMax) || fallback.estimatedPriceMax,
        estimatedPriceMedian: Number(aiData.estimatedPriceMedian) || fallback.estimatedPriceMedian,
        priceDifference,
        percentageDiff,
        confidence: Math.min(99, Math.max(70, Number(aiData.confidence) || fallback.confidence)),
        verdict: aiData.verdict || fallback.verdict,
        factors: Array.isArray(aiData.factors) && aiData.factors.length > 0 ? aiData.factors : fallback.factors,
        negotiationAdvice: aiData.negotiationAdvice || fallback.negotiationAdvice,
        categoryBenchmark: fallback.categoryBenchmark,
        comparables: fallback.comparables,
        isAiPowered: true,
        isFallback: Boolean(aiData.isFallback),
        analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      ESTIMATE_CACHE.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    }
  } catch (err) {
    console.warn('AI market price estimate endpoint error, using local statistical valuation:', err);
  }

  // Gracefully return local fallback
  ESTIMATE_CACHE.set(cacheKey, {
    timestamp: Date.now(),
    data: { ...fallback, isFallback: true },
  });
  return { ...fallback, isFallback: true };
}

/**
 * Category baseline prices for Ghana marketplace when few comparables exist
 */
const CATEGORY_DEFAULT_PRICE: Record<string, number> = {
  vehicles: 75000,
  property: 280000,
  'phones-tablets': 5200,
  electronics: 4800,
  'home-furniture': 3200,
  fashion: 350,
  'beauty-care': 250,
  services: 1200,
  'repair-construction': 2800,
  'commercial-equipment': 18000,
  'leisure-activities': 1100,
  'babies-kids': 450,
  'food-agriculture': 1800,
  'animals-pets': 2000,
  jobs: 3000,
  'seeking-work-cvs': 2500,
  'business-industry': 14000,
};

/**
 * Client-side fallback calculator for smart price recommendations
 */
export function calculateLocalSmartPrice(
  request: SmartPriceRequest,
  allListings: Listing[]
): SmartPriceAdvice {
  // 1. Gather category items
  const candidates = allListings.filter(
    (l) => l.categoryId === request.categoryId && typeof l.price === 'number' && l.price > 0
  );

  const subcatMatches = candidates.filter(
    (l) => l.subcategory.toLowerCase() === request.subcategory.toLowerCase()
  );

  const relevantListings = subcatMatches.length >= 2 ? subcatMatches : candidates;

  let basePrice = CATEGORY_DEFAULT_PRICE[request.categoryId] || 3000;

  if (relevantListings.length > 0) {
    const prices = relevantListings.map((l) => l.price).sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    basePrice = prices.length % 2 !== 0 ? prices[mid] : Math.round((prices[mid - 1] + prices[mid]) / 2);
  }

  // Title keyword smart adjustment
  const titleLower = request.title.toLowerCase();
  if (titleLower.includes('pro max') || titleLower.includes('ultra') || titleLower.includes('titanium')) {
    basePrice = Math.round(basePrice * 1.35);
  } else if (titleLower.includes('macbook') || titleLower.includes('laptop') || titleLower.includes('gaming')) {
    if (basePrice < 5000) basePrice = 6500;
  } else if (titleLower.includes('ps5') || titleLower.includes('playstation 5')) {
    basePrice = 8200;
  } else if (titleLower.includes('toyota') || titleLower.includes('honda') || titleLower.includes('hyundai')) {
    if (basePrice < 45000) basePrice = 75000;
  }

  // Condition multiplier
  let conditionMultiplier = 1.0;
  if (request.condition === 'Brand New') conditionMultiplier = 1.08;
  else if (request.condition === 'Like New / Mint') conditionMultiplier = 0.98;
  else if (request.condition === 'Refurbished') conditionMultiplier = 0.88;
  else if (request.condition === 'Fairly Used') conditionMultiplier = 0.76;

  const optimal = Math.round(basePrice * conditionMultiplier);
  const quick = Math.round(optimal * 0.88);
  const premium = Math.round(optimal * 1.14);

  return {
    recommendedPrice: optimal,
    quickSalePrice: quick,
    premiumPrice: premium,
    currency: 'GH₵',
    marketTrend: 'Active Buyer Interest in Ghana 🔥',
    demandLevel: 'high',
    estimatedDaysToSell: '2 - 5 days at recommended price, <48h for quick sale',
    summary: `Based on active listings in ${request.subcategory || request.categoryName}, setting GH₵ ${optimal.toLocaleString()} puts your ad right in the optimal buyer sweet spot.`,
    reasons: [
      `Condition '${request.condition}' factored against standard depreciation in ${request.region.split('(')[0].trim()}.`,
      `Calibrated against ${relevantListings.length} comparable marketplace listings in ${request.categoryName}.`,
      `Priced competitively to trigger direct WhatsApp chats from verified buyers.`,
    ],
    proTip: "Keep 'Price is Negotiable' checked to invite quick offers and close deals swiftly on WhatsApp.",
    suggestedNegotiable: true,
    isAiPowered: false,
    isFallback: true,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Fetch AI-powered Smart Price recommendation from server-side Gemini API
 */
export async function fetchSmartPriceAdvice(
  request: SmartPriceRequest,
  allListings: Listing[]
): Promise<SmartPriceAdvice> {
  const localFallback = calculateLocalSmartPrice(request, allListings);

  try {
    const candidates = allListings.filter(
      (l) => l.categoryId === request.categoryId && typeof l.price === 'number' && l.price > 0
    );

    const subcatMatches = candidates.filter(
      (l) => l.subcategory.toLowerCase() === request.subcategory.toLowerCase()
    );

    const relevant = subcatMatches.length >= 2 ? subcatMatches : candidates;
    const prices = relevant.map((c) => c.price);
    const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : localFallback.recommendedPrice;
    const sorted = [...prices].sort((a, b) => a - b);
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : localFallback.recommendedPrice;

    const payload = {
      title: request.title,
      categoryId: request.categoryId,
      categoryName: request.categoryName,
      subcategory: request.subcategory,
      condition: request.condition,
      region: request.region,
      location: request.location,
      description: request.description,
      categoryBenchmark: {
        categoryAveragePrice: avg,
        categoryMedianPrice: median,
        sampleSize: sorted.length,
      },
      similarItems: relevant.slice(0, 8).map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        currency: item.currency,
        condition: item.condition,
        location: item.location,
      })),
    };

    const response = await fetch('/api/smart-price-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error(`Smart Price API error: ${response.status}`);
    }

    const aiData = await response.json();

    if (aiData && typeof aiData.recommendedPrice === 'number') {
      return {
        recommendedPrice: Number(aiData.recommendedPrice),
        quickSalePrice: Number(aiData.quickSalePrice) || Math.round(aiData.recommendedPrice * 0.88),
        premiumPrice: Number(aiData.premiumPrice) || Math.round(aiData.recommendedPrice * 1.14),
        currency: aiData.currency || 'GH₵',
        marketTrend: aiData.marketTrend || 'High Demand in Ghana 🔥',
        demandLevel: aiData.demandLevel || 'high',
        estimatedDaysToSell: aiData.estimatedDaysToSell || '2 - 5 days',
        summary: aiData.summary || localFallback.summary,
        reasons: Array.isArray(aiData.reasons) && aiData.reasons.length > 0 ? aiData.reasons : localFallback.reasons,
        proTip: aiData.proTip || localFallback.proTip,
        suggestedNegotiable: typeof aiData.suggestedNegotiable === 'boolean' ? aiData.suggestedNegotiable : true,
        isAiPowered: Boolean(aiData.isAiPowered),
        isFallback: Boolean(aiData.isFallback),
        analyzedAt: aiData.analyzedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  } catch (err) {
    console.warn('AI Smart Price Advisor route notice, using local statistical valuation:', err);
  }

  return localFallback;
}

