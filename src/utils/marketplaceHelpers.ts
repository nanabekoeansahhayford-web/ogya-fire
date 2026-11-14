import { Product, Review } from '../types/store';
import { Listing } from '../types/marketplace';

export const HOME_LOCATIONS = [
  'All',
  'Accra',
  'Amasaman',
  'Madina',
  'Kasoa',
  'Kumasi',
  'Tema',
  'Legon',
] as const;

export type HomeLocation = (typeof HOME_LOCATIONS)[number];

/**
 * Check if an item (listing or product) matches the chosen Home location filter.
 * Supports specific suburbs like Amasaman, Madina, Kasoa, Legon as well as Accra, Kumasi, Tema.
 */
export function matchesLocationFilter(
  locationStr?: string,
  regionStr?: string,
  selectedLocation?: string
): boolean {
  if (
    !selectedLocation ||
    selectedLocation === 'all' ||
    selectedLocation === 'All' ||
    selectedLocation === 'All Regions' ||
    selectedLocation === 'All Ghana'
  ) {
    return true;
  }

  const sel = selectedLocation.trim().toLowerCase();
  const loc = (locationStr || '').toLowerCase();
  const reg = (regionStr || '').toLowerCase();

  // Direct substring match on location or region
  if (loc.includes(sel)) return true;

  // Suburb-specific checks so Amasaman / Madina / Kasoa / Legon match cleanly
  if (sel === 'legon') {
    return loc.includes('legon') || loc.includes('east legon') || loc.includes('upsa');
  }
  if (sel === 'amasaman') {
    return loc.includes('amasaman') || loc.includes('pokuase') || loc.includes('nsawam');
  }
  if (sel === 'madina') {
    return loc.includes('madina') || loc.includes('adenta') || loc.includes('haatso');
  }
  if (sel === 'kasoa') {
    return loc.includes('kasoa') || loc.includes('weija') || loc.includes('buduburam');
  }
  if (sel === 'tema') {
    return loc.includes('tema') || loc.includes('afienya') || loc.includes('dawhenya') || loc.includes('ashaiman');
  }
  if (sel === 'kumasi') {
    return (
      loc.includes('kumasi') ||
      reg.includes('kumasi') ||
      reg.includes('ashanti') ||
      ['kejetia', 'bantama', 'ahodwo', 'anloga', 'knust', 'adum', 'bonwire', 'obuasi', 'suame'].some((k) =>
        loc.includes(k)
      )
    );
  }
  if (sel === 'accra') {
    return (
      loc.includes('accra') ||
      reg.includes('greater accra') ||
      [
        'accra',
        'legon',
        'east legon',
        'madina',
        'amasaman',
        'osu',
        'spintex',
        'cantonments',
        'dansoman',
        'circle',
        'lapaz',
        'kaneshie',
        'airport',
        'labone',
        'tesano',
        'achimota',
      ].some((k) => loc.includes(k))
    );
  }

  // Fallback for full region dropdown strings e.g. "Ashanti (Kumasi, Obuasi, Ejisu)"
  const mainKey = sel.split('(')[0].trim();
  if (mainKey && (reg.includes(mainKey) || loc.includes(mainKey))) return true;

  if (sel.includes('(')) {
    const inside = sel.replace(/^[^(]*\(([^)]*)\).*$/, '$1');
    const towns = inside.split(',').map((t) => t.trim()).filter((t) => t.length > 2);
    if (towns.some((t) => loc.includes(t) || reg.includes(t))) return true;
  }

  return reg.includes(sel);
}

/**
 * Determine whether a Listing or Product seller holds Verified status.
 */
export function isListingSellerVerified(listing: Listing): boolean {
  const s = listing?.seller;
  if (!s) return false;
  return Boolean(s.isVerified || s.isSubscribedVerified || s.ghanaCardVerified || s.momoVerified);
}

export function isProductSellerVerified(product: Product): boolean {
  if (!product) return false;
  if (typeof product.isVerified === 'boolean') return product.isVerified;
  if (product.vendorId === 'vnd-daniel-arnan' || product.vendorName?.toLowerCase().includes('daniel')) {
    return true;
  }
  return false;
}

/**
 * Compute real review summary (average rating 0-5, total count, sorted matching reviews)
 */
export function getReviewSummary(
  reviews: Review[],
  opts: {
    productId?: string;
    listingId?: string;
    sellerId?: string;
    sellerName?: string;
    fallbackRating?: number;
    fallbackCount?: number;
  }
): {
  avgRating: number;
  count: number;
  matchingReviews: Review[];
  hasRealReviews: boolean;
} {
  const normSellerName = (opts.sellerName || '').trim().toLowerCase();

  const matching = (reviews || []).filter((r) => {
    if (opts.productId && r.productId && r.productId === opts.productId) return true;
    if (opts.listingId && r.listingId && r.listingId === opts.listingId) return true;
    if (opts.sellerId && r.sellerId && r.sellerId === opts.sellerId) return true;
    if (normSellerName && r.sellerName && r.sellerName.trim().toLowerCase() === normSellerName) return true;
    return false;
  });

  if (matching.length > 0) {
    const sum = matching.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return {
      avgRating: Number((sum / matching.length).toFixed(1)),
      count: matching.length,
      matchingReviews: matching,
      hasRealReviews: true,
    };
  }

  return {
    avgRating: opts.fallbackRating ?? 0,
    count: opts.fallbackCount ?? 0,
    matchingReviews: [],
    hasRealReviews: false,
  };
}
