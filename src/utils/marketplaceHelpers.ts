import { Product, Review } from '../types/store';
import { FilterState, Listing } from '../types/marketplace';
import { computeSellerBadges } from './reputation';

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

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.category !== 'all') count++;
  if (filters.subcategory && filters.subcategory !== 'all') count++;
  if (
    filters.region &&
    filters.region !== 'all' &&
    filters.region !== 'All Regions' &&
    filters.region !== 'All Ghana'
  ) {
    count++;
  }
  if (filters.minPrice.trim() || filters.maxPrice.trim()) count++;
  if (filters.condition !== 'all') count++;
  if (filters.onlyVerified) count++;
  if (filters.badgeFilter && filters.badgeFilter !== 'all') count++;
  if (filters.sortBy && filters.sortBy !== 'newest') count++;
  return count;
}

export function filterAndSortListings(listings: Listing[], filters: FilterState): Listing[] {
  return listings
    .filter((item) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCategory = item.categoryName.toLowerCase().includes(q);
        const matchSubcategory = item.subcategory.toLowerCase().includes(q);
        const matchLocation = item.location.toLowerCase().includes(q);
        const matchSeller = item.seller.name.toLowerCase().includes(q);
        const matchCV = item.cvDetails
          ? item.cvDetails.candidateName.toLowerCase().includes(q) ||
            item.cvDetails.skills.some((s) => s.toLowerCase().includes(q))
          : false;
        const matchJob = item.jobDetails
          ? item.jobDetails.companyName.toLowerCase().includes(q) ||
            item.jobDetails.requirements.some((r) => r.toLowerCase().includes(q))
          : false;

        if (!matchTitle && !matchDesc && !matchCategory && !matchSubcategory && !matchLocation && !matchSeller && !matchCV && !matchJob) {
          return false;
        }
      }

      // Category
      if (filters.category !== 'all') {
        if (filters.category === 'laptops') {
          const isLaptop =
            item.categoryId === 'laptops' ||
            item.subcategory.toLowerCase().includes('laptop') ||
            item.title.toLowerCase().includes('laptop') ||
            item.title.toLowerCase().includes('macbook');
          if (!isLaptop) return false;
        } else if (filters.category === 'accessories') {
          const isAcc =
            item.categoryId === 'accessories' ||
            item.subcategory.toLowerCase().includes('accessor') ||
            item.subcategory.toLowerCase().includes('auto parts') ||
            item.title.toLowerCase().includes('earbuds') ||
            item.title.toLowerCase().includes('charger') ||
            item.title.toLowerCase().includes('headphone') ||
            item.title.toLowerCase().includes('phone case');
          if (!isAcc) return false;
        } else if (item.categoryId !== filters.category) {
          return false;
        }
      }

      // Subcategory
      if (filters.subcategory && filters.subcategory !== 'all' && item.subcategory !== filters.subcategory) {
        return false;
      }

      // Location filter across Ghana
      if (!matchesLocationFilter(item.location, item.region, filters.region)) {
        return false;
      }

      // Price range
      if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
        if (item.price < Number(filters.minPrice)) return false;
      }
      if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
        if (item.price > Number(filters.maxPrice)) return false;
      }

      // Condition
      if (filters.condition !== 'all' && item.condition !== filters.condition) {
        return false;
      }

      // Only verified
      if (filters.onlyVerified && !isListingSellerVerified(item)) {
        return false;
      }

      // Reputation Badge Filter
      if (filters.badgeFilter && filters.badgeFilter !== 'all') {
        const itemBadges = computeSellerBadges(item.seller);
        if (!itemBadges.includes(filters.badgeFilter)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // 1. Pinned promoted listings always rank first
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;

      // 2. Verified sellers always rank before unverified sellers
      const aVerified = isListingSellerVerified(a) ? 1 : 0;
      const bVerified = isListingSellerVerified(b) ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;

      if (filters.sortBy === 'top-rated') {
        return b.seller.rating - a.seller.rating || b.seller.reviewCount - a.seller.reviewCount;
      }
      if (filters.sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price-high') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'popular') {
        return b.viewsCount - a.viewsCount;
      }
      // default: newest
      return b.id.localeCompare(a.id);
    });
}

