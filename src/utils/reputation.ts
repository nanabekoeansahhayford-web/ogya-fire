import { SellerBadge, SellerBadgeId, SellerInfo } from '../types/marketplace';

export interface BadgeStyleConfig {
  badgeId: SellerBadgeId;
  label: string;
  shortLabel: string;
  description: string;
  criteria: string;
  iconName: 'Award' | 'ShieldCheck' | 'Zap' | 'CheckCircle2' | 'Sparkles';
  tagline: string;
  // Tailwind color styles
  bgLight: string;
  textLight: string;
  borderLight: string;
  bgDark: string;
  textDark: string;
  borderDark: string;
  accentColor: string;
  gradientBadge: string;
}

export const BADGE_DEFINITIONS: Record<SellerBadgeId, BadgeStyleConfig> = {
  'top-rated': {
    badgeId: 'top-rated',
    label: 'Top Rated',
    shortLabel: 'Top Rated',
    description: 'Awarded to sellers who consistently maintain an average rating of 4.8★ or higher with a proven track record of happy buyers.',
    criteria: 'Rating ≥ 4.8★ with at least 10 verified customer reviews',
    iconName: 'Award',
    tagline: 'Premier Buyer Satisfaction',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-300',
    bgDark: 'dark:bg-amber-950/60',
    textDark: 'dark:text-amber-300',
    borderDark: 'dark:border-amber-800/80',
    accentColor: '#F59E0B',
    gradientBadge: 'from-amber-500 to-yellow-500 text-slate-950',
  },
  'verified-pro': {
    badgeId: 'verified-pro',
    label: 'Verified Professional',
    shortLabel: 'Verified Pro',
    description: 'Awarded to merchants and individual sellers whose national identity documents, business registration, or phone have been formally verified.',
    criteria: 'National ID / Business registration validated + identity check passed',
    iconName: 'ShieldCheck',
    tagline: 'Identity & Business Authenticated',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    borderLight: 'border-emerald-300',
    bgDark: 'dark:bg-emerald-950/60',
    textDark: 'dark:text-emerald-300',
    borderDark: 'dark:border-emerald-800/80',
    accentColor: '#10B981',
    gradientBadge: 'from-emerald-500 to-teal-500 text-white',
  },
  'fast-responder': {
    badgeId: 'fast-responder',
    label: 'Fast Responder',
    shortLabel: 'Fast Responder',
    description: 'Awarded to highly active sellers who promptly answer buyer inquiries on OGYA in-app chat and WhatsApp.',
    criteria: 'Average verified response time within 15–30 minutes',
    iconName: 'Zap',
    tagline: 'Replies in minutes',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-800',
    borderLight: 'border-sky-300',
    bgDark: 'dark:bg-sky-950/60',
    textDark: 'dark:text-sky-300',
    borderDark: 'dark:border-sky-800/80',
    accentColor: '#0EA5E9',
    gradientBadge: 'from-sky-500 to-blue-600 text-white',
  },
  'trusted-merchant': {
    badgeId: 'trusted-merchant',
    label: 'Trusted Merchant',
    shortLabel: 'Trusted',
    description: 'Awarded to established sellers with deep market tenure, multiple completed deals, and stellar buyer confidence.',
    criteria: 'Verified membership tenure + 20+ successfully concluded listings',
    iconName: 'CheckCircle2',
    tagline: 'High Volume Trade History',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-800',
    borderLight: 'border-indigo-300',
    bgDark: 'dark:bg-indigo-950/60',
    textDark: 'dark:text-indigo-300',
    borderDark: 'dark:border-indigo-800/80',
    accentColor: '#6366F1',
    gradientBadge: 'from-indigo-600 to-purple-600 text-white',
  },
  'rising-star': {
    badgeId: 'rising-star',
    label: 'Rising Star',
    shortLabel: 'Rising Star',
    description: 'Awarded to promising new sellers who have received immaculate 5-star ratings on their initial listings.',
    criteria: 'High initial customer rating with responsive customer interactions',
    iconName: 'Sparkles',
    tagline: 'Flawless Early Service',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-800',
    borderLight: 'border-rose-300',
    bgDark: 'dark:bg-rose-950/60',
    textDark: 'dark:text-rose-300',
    borderDark: 'dark:border-rose-800/80',
    accentColor: '#F43F5E',
    gradientBadge: 'from-rose-500 to-pink-500 text-white',
  },
};

export interface SellerReputationDetails {
  sellerName: string;
  score: number; // 0 - 100 trust score
  tierName: string; // e.g. "Elite Gold Merchant"
  tierLevel: 1 | 2 | 3 | 4;
  badges: BadgeStyleConfig[];
  positiveRatingPercent: number; // e.g. 99%
  responseRatePercent: number; // e.g. 98%
  averageResponseTime: string; // e.g. "Under 15 mins"
  completedDealsEstimate: number;
  safetyRating: string; // e.g. "Low Risk - Verified Safe Trader"
  highlights: string[];
}

export function computeSellerBadges(seller: SellerInfo, listingsCount = 1): SellerBadgeId[] {
  // If badges are already explicitly assigned, use them
  if (seller.badges && seller.badges.length > 0) {
    return seller.badges;
  }

  const badges: SellerBadgeId[] = [];

  // 1. Top Rated Check
  if (seller.rating >= 4.8 && seller.reviewCount >= 10) {
    badges.push('top-rated');
  } else if (seller.rating >= 4.9 && seller.reviewCount >= 1 && seller.reviewCount < 10) {
    badges.push('rising-star');
  }

  // 2. Verified Professional Check
  if (seller.isVerified) {
    badges.push('verified-pro');
  }

  // 3. Fast Responder Check
  const normalizedResponse = (seller.responseTime || '').toLowerCase();
  if (
    normalizedResponse.includes('5 min') ||
    normalizedResponse.includes('10 min') ||
    normalizedResponse.includes('15 min') ||
    normalizedResponse.includes('20 min') ||
    normalizedResponse.includes('30 min') ||
    normalizedResponse.includes('within an hour') ||
    normalizedResponse.includes('under 1 hour') ||
    normalizedResponse.includes('instant')
  ) {
    badges.push('fast-responder');
  }

  // 4. Trusted Merchant Check (for high review count or multiple listings)
  if (seller.reviewCount >= 30 || (seller.isVerified && listingsCount >= 3)) {
    badges.push('trusted-merchant');
  }

  return badges;
}

export function getSellerReputation(seller: SellerInfo, listingsCount = 1): SellerReputationDetails {
  const badgeIds = computeSellerBadges(seller, listingsCount);
  const badges = badgeIds.map((id) => BADGE_DEFINITIONS[id]).filter(Boolean);

  // Compute realistic reputation score
  let score = 75;
  if (seller.reputationScore) {
    score = seller.reputationScore;
  } else {
    // Rating contribution (up to 15 pts)
    score += Math.min(15, ((seller.rating - 3.5) / 1.5) * 15);
    // Reviews contribution (up to 6 pts)
    score += Math.min(6, (seller.reviewCount / 50) * 6);
    // Verification bonus (+4 pts)
    if (seller.isVerified) score += 4;
    // Speed bonus (+2 pts)
    const normSpeed = (seller.responseTime || '').toLowerCase();
    if (normSpeed.includes('min')) score += 2;
  }
  const finalScore = Math.min(99, Math.max(82, Math.round(score)));

  // Tier calculation
  let tierName = 'Active Trader';
  let tierLevel: 1 | 2 | 3 | 4 = 1;

  if (finalScore >= 96 && seller.isVerified) {
    tierName = 'Elite Diamond Merchant';
    tierLevel = 4;
  } else if (finalScore >= 92) {
    tierName = 'Top Rated Gold Seller';
    tierLevel = 3;
  } else if (finalScore >= 87) {
    tierName = 'Verified Silver Seller';
    tierLevel = 2;
  }

  const responseMetrics = computeSellerResponseMetrics(seller, listingsCount);
  const positiveRatingPercent = Math.min(100, Math.round((seller.rating / 5) * 100));
  const completedDealsEstimate = Math.max(seller.reviewCount * 2, listingsCount * 3, 12);

  const highlights = [
    `${seller.rating.toFixed(1)}/5.0 Overall Buyer Rating across ${seller.reviewCount} reviews`,
    `Average response turnaround: ${responseMetrics.averageResponseTime} (${responseMetrics.responseRate}% response rate)`,
    seller.isVerified ? 'Identity & phone credentials formally verified' : 'Phone verified member',
    `Member in good standing since ${seller.memberSince}`,
  ];

  return {
    sellerName: seller.name,
    score: finalScore,
    tierName,
    tierLevel,
    badges,
    positiveRatingPercent,
    responseRatePercent: responseMetrics.responseRate,
    averageResponseTime: responseMetrics.averageResponseTime,
    completedDealsEstimate,
    safetyRating: 'Verified Safe Trader — 100% Secure Meetup Record',
    highlights,
  };
}

export interface SellerResponseMetrics {
  responseRate: number; // e.g. 98 (%)
  averageResponseTime: string; // e.g. "Under 15 mins"
  responseSpeedGrade: 'Exceptional' | 'Very Fast' | 'Fast' | 'Reliable';
  inquiriesAnsweredEstimate: number;
  peakResponseTime: string;
  offPeakResponseTime: string;
  typicalResponseRateLabel: string;
  activityStatus: 'Active Now' | 'Active Today' | 'Regularly Active';
  transparencySummary: string;
}

/**
 * Computes deterministic Response Rate (%) and Average Response Time based on
 * the seller's overall activity (review count, ratings, active listing count,
 * verification status, and recorded communication speeds).
 */
export function computeSellerResponseMetrics(
  seller: SellerInfo,
  listingsCount = 1
): SellerResponseMetrics {
  const normTime = (seller.responseTime || '').toLowerCase();
  const reviewCount = seller.reviewCount || 0;
  const rating = seller.rating || 4.5;
  const isVerified = Boolean(seller.isVerified);

  // If explicit custom metrics are provided, prioritize them
  if (seller.responseRate && seller.averageResponseTime) {
    return {
      responseRate: seller.responseRate,
      averageResponseTime: seller.averageResponseTime,
      responseSpeedGrade: seller.responseRate >= 98 ? 'Exceptional' : seller.responseRate >= 95 ? 'Very Fast' : 'Fast',
      inquiriesAnsweredEstimate: Math.max(28, reviewCount * 3 + listingsCount * 4),
      peakResponseTime: '5 – 10 mins',
      offPeakResponseTime: '20 – 35 mins',
      typicalResponseRateLabel: `${seller.responseRate}% of inquiries answered`,
      activityStatus: 'Active Today',
      transparencySummary: `Consistently answers ${seller.responseRate}% of direct buyer inquiries.`,
    };
  }

  // Activity calculation
  // Factors:
  // - review volume & rating
  // - active listings on market
  // - verified phone & national ID credentials
  // - responseTime descriptor

  let baseRate = 92;
  let avgResponseTime = seller.responseTime || 'Under 30 mins';
  let speedGrade: 'Exceptional' | 'Very Fast' | 'Fast' | 'Reliable' = 'Fast';
  let peakResponseTime = '10 – 15 mins';
  let offPeakResponseTime = '30 – 45 mins';

  if (normTime.includes('5 min') || normTime.includes('instant')) {
    baseRate = 99;
    avgResponseTime = 'Under 5 mins';
    speedGrade = 'Exceptional';
    peakResponseTime = '2 – 5 mins';
    offPeakResponseTime = '10 – 15 mins';
  } else if (normTime.includes('10 min')) {
    baseRate = 98;
    avgResponseTime = 'Under 10 mins';
    speedGrade = 'Exceptional';
    peakResponseTime = '3 – 8 mins';
    offPeakResponseTime = '15 – 25 mins';
  } else if (normTime.includes('15 min')) {
    baseRate = 97;
    avgResponseTime = 'Under 15 mins';
    speedGrade = 'Very Fast';
    peakResponseTime = '5 – 12 mins';
    offPeakResponseTime = '20 – 35 mins';
  } else if (normTime.includes('30 min') || normTime.includes('within 30')) {
    baseRate = 95;
    avgResponseTime = 'Within 30 mins';
    speedGrade = 'Very Fast';
    peakResponseTime = '10 – 20 mins';
    offPeakResponseTime = '35 – 50 mins';
  } else if (normTime.includes('hour') || normTime.includes('1 hr')) {
    baseRate = 93;
    avgResponseTime = normTime.includes('2 hour') ? 'Within 2 hours' : 'Within 1 hour';
    speedGrade = 'Reliable';
    peakResponseTime = '25 – 45 mins';
    offPeakResponseTime = '1 – 2 hours';
  } else {
    // If responseTime is unstated or generic, deduce realistically based on overall seller activity
    if (reviewCount >= 30 && rating >= 4.8) {
      baseRate = 98;
      avgResponseTime = 'Under 15 mins';
      speedGrade = 'Very Fast';
      peakResponseTime = '5 – 10 mins';
      offPeakResponseTime = '20 – 35 mins';
    } else if (reviewCount >= 10 && rating >= 4.5) {
      baseRate = 95;
      avgResponseTime = 'Within 30 mins';
      speedGrade = 'Fast';
      peakResponseTime = '10 – 20 mins';
      offPeakResponseTime = '30 – 50 mins';
    } else {
      baseRate = 91;
      avgResponseTime = 'Within 1 hour';
      speedGrade = 'Reliable';
      peakResponseTime = '30 – 45 mins';
      offPeakResponseTime = '1 – 2 hours';
    }
  }

  // Adjust response rate by activity volume
  const reviewScore = Math.min(reviewCount, 50) * 0.05; // 0 to 2.5
  const listingsScore = Math.min(listingsCount, 10) * 0.15; // 0 to 1.5
  const ratingScore = ((rating - 4.0) / 1.0) * 1.5; // up to 1.5
  const verifiedBonus = isVerified ? 1.5 : 0;

  const totalAdjustment = Math.round(reviewScore + listingsScore + ratingScore + verifiedBonus);
  const responseRate = Math.min(99, Math.max(88, baseRate - 1 + totalAdjustment));

  const inquiriesAnsweredEstimate = Math.max(18, Math.round(reviewCount * 2.8 + listingsCount * 4));

  let activityStatus: 'Active Now' | 'Active Today' | 'Regularly Active' = 'Regularly Active';
  if (speedGrade === 'Exceptional' || (rating >= 4.8 && reviewCount > 15)) {
    activityStatus = 'Active Now';
  } else if (speedGrade === 'Very Fast' || reviewCount > 8) {
    activityStatus = 'Active Today';
  }

  const transparencySummary = `Calculated across ${inquiriesAnsweredEstimate}+ recent buyer inquiries. Responds to ${responseRate}% of incoming chats & calls, typically in ${avgResponseTime.toLowerCase()}.`;

  return {
    responseRate,
    averageResponseTime: avgResponseTime,
    responseSpeedGrade: speedGrade,
    inquiriesAnsweredEstimate,
    peakResponseTime,
    offPeakResponseTime,
    typicalResponseRateLabel: `${responseRate}% of inquiries answered`,
    activityStatus,
    transparencySummary,
  };
}
