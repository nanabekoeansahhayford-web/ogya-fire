import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { HeroBanner } from './components/HeroBanner';
import { ListingCard } from './components/ListingCard';
import { SplashScreen } from './components/SplashScreen';
import { PWAInstallBanner } from './components/PWAInstallPrompt';
import {
  ProductGridSkeleton,
  SectionSkeleton,
  PageLoadingSkeleton,
  ModalLoadingFallback,
} from './components/LoadingSkeleton';
import type { FoodVendor, FoodMenuItem } from './data/foodVendors';
import { Product, Vendor, Order, CartItem, Review, matchesProductCategoryFilter } from './types/store';
import { SEED_PRODUCTS } from './data/seedProducts';
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
} from './utils/cartStorage';
import type { CourierOrder } from './types/courier';
import { CategoryId, FilterState, Listing, SellerInfo, UserProfile, WantedItem } from './types/marketplace';
import { CATEGORIES } from './data/categories';
import {
  getStoredListings,
  getSavedListingIds,
  toggleSaveListingId,
  getPriceAlertIds,
  togglePriceAlertId,
  markListingAsBoosted,
  updateStoredListing,
} from './utils/storage';
import { getCurrentUser, logoutUser, syncUserProfileFromFirebaseAuth } from './utils/auth';
import { useDarkMode } from './utils/theme';
import { computeSellerBadges, BADGE_DEFINITIONS } from './utils/reputation';
import {
  auth,
  testConnection,
  subscribeToAuthState,
  ensureUserDocOnLogin,
  fetchListingsPage,
  fetchProductsPage,
  fetchProductsFromFirestore,
  fetchVendorByOwnerId,
  fetchWantedItemsFromFirestore,
  getLocalWantedItems,
  fetchReviewsFromFirestore,
  getLocalReviews,
  getCachedProducts,
  getCachedListings,
  QueryDocumentSnapshot,
  DocumentData,
} from './utils/firebase';
import {
  HOME_LOCATIONS,
  matchesLocationFilter,
  isListingSellerVerified,
} from './utils/marketplaceHelpers';
import type { LegalPageId } from './components/LegalPagesModal';
import type { WhatsAppOrderTarget } from './components/WhatsAppOrderModal';
import { SlidersHorizontal, CheckCircle2, ShieldCheck, Plus, AlertCircle, Award, Home, Store, ShoppingCart, MapPin, Search, User } from 'lucide-react';

// Lazy-loaded standalone route pages
const VendorDashboardPage = lazy(() =>
  import('./components/VendorDashboardPage').then((m) => ({ default: m.VendorDashboardPage }))
);
const BecomeVerifiedPage = lazy(() =>
  import('./components/BecomeVerifiedPage').then((m) => ({ default: m.BecomeVerifiedPage }))
);
const LegalPageView = lazy(() =>
  import('./components/LegalPageView').then((m) => ({ default: m.LegalPageView }))
);

// Lazy-loaded below-the-fold sections & layout chrome
const BuyersWantFeed = lazy(() =>
  import('./components/BuyersWantFeed').then((m) => ({ default: m.BuyersWantFeed }))
);
const FoodVendorsSection = lazy(() =>
  import('./components/FoodVendorsSection').then((m) => ({ default: m.FoodVendorsSection }))
);
const StoreProductsSection = lazy(() =>
  import('./components/StoreProductsSection').then((m) => ({ default: m.StoreProductsSection }))
);
const FilterSidebar = lazy(() =>
  import('./components/FilterSidebar').then((m) => ({ default: m.FilterSidebar }))
);
const RecentlyViewed = lazy(() =>
  import('./components/RecentlyViewed').then((m) => ({ default: m.RecentlyViewed }))
);
const Footer = lazy(() =>
  import('./components/Footer').then((m) => ({ default: m.Footer }))
);

// Lazy-loaded modals & drawers (fetched on demand when opened)
const ListingDetailModal = lazy(() =>
  import('./components/ListingDetailModal').then((m) => ({ default: m.ListingDetailModal }))
);
const SellerProfileModal = lazy(() =>
  import('./components/SellerProfileModal').then((m) => ({ default: m.SellerProfileModal }))
);
const ChatModal = lazy(() =>
  import('./components/ChatModal').then((m) => ({ default: m.ChatModal }))
);
const PostAdModal = lazy(() =>
  import('./components/PostAdModal').then((m) => ({ default: m.PostAdModal }))
);
const SavedAdsDrawer = lazy(() =>
  import('./components/SavedAdsDrawer').then((m) => ({ default: m.SavedAdsDrawer }))
);
const SafetyModal = lazy(() =>
  import('./components/SafetyModal').then((m) => ({ default: m.SafetyModal }))
);
const BoostAdModal = lazy(() =>
  import('./components/BoostAdModal').then((m) => ({ default: m.BoostAdModal }))
);
const AuthModal = lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const UserProfileModal = lazy(() =>
  import('./components/UserProfileModal').then((m) => ({ default: m.UserProfileModal }))
);
const SellerDashboardModal = lazy(() =>
  import('./components/SellerDashboardModal').then((m) => ({ default: m.SellerDashboardModal }))
);
const ReportListingModal = lazy(() =>
  import('./components/ReportListingModal').then((m) => ({ default: m.ReportListingModal }))
);
const CourierHubModal = lazy(() =>
  import('./components/CourierHubModal').then((m) => ({ default: m.CourierHubModal }))
);
const CourierOrderModal = lazy(() =>
  import('./components/CourierOrderModal').then((m) => ({ default: m.CourierOrderModal }))
);
const CourierTrackingModal = lazy(() =>
  import('./components/CourierTrackingModal').then((m) => ({ default: m.CourierTrackingModal }))
);
const VerifiedSubscriptionModal = lazy(() =>
  import('./components/VerifiedSubscriptionModal').then((m) => ({ default: m.VerifiedSubscriptionModal }))
);
const ProductDetailModal = lazy(() =>
  import('./components/ProductDetailModal').then((m) => ({ default: m.ProductDetailModal }))
);
const CartModal = lazy(() =>
  import('./components/CartModal').then((m) => ({ default: m.CartModal }))
);
const CheckoutModal = lazy(() =>
  import('./components/CheckoutModal').then((m) => ({ default: m.CheckoutModal }))
);
const MyOrdersModal = lazy(() =>
  import('./components/MyOrdersModal').then((m) => ({ default: m.MyOrdersModal }))
);
const BecomeVendorModal = lazy(() =>
  import('./components/BecomeVendorModal').then((m) => ({ default: m.BecomeVendorModal }))
);
const VendorDashboardModal = lazy(() =>
  import('./components/VendorDashboardModal').then((m) => ({ default: m.VendorDashboardModal }))
);
const IWantThisModal = lazy(() =>
  import('./components/IWantThisModal').then((m) => ({ default: m.IWantThisModal }))
);
const LegalPagesModal = lazy(() =>
  import('./components/LegalPagesModal').then((m) => ({ default: m.LegalPagesModal }))
);
const WhatsAppOrderModal = lazy(() =>
  import('./components/WhatsAppOrderModal').then((m) => ({ default: m.WhatsAppOrderModal }))
);

export default function App() {
  const { isDark, toggleTheme } = useDarkMode();
  const [listings, setListings] = useState<Listing[]>(() => {
    const cached = getCachedListings();
    const local = getStoredListings();
    if (cached && cached.length > 0) {
      const remoteMap = new Map(cached.map((l) => [l.id, l]));
      const merged = [...cached];
      local.forEach((item) => {
        if (!remoteMap.has(item.id)) merged.push(item);
      });
      return merged;
    }
    return local;
  });
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(() => !getCachedListings());
  const [listingsCursor, setListingsCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreRemoteListings, setHasMoreRemoteListings] = useState<boolean>(false);
  const [isLoadingMoreListings, setIsLoadingMoreListings] = useState<boolean>(false);
  const [visibleListingsCount, setVisibleListingsCount] = useState<number>(20);

  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedListingIds());
  const [priceAlerts, setPriceAlerts] = useState<string[]>(() => getPriceAlertIds());
  const [reviews, setReviews] = useState<Review[]>(() => getLocalReviews());
  const [whatsAppOrderTarget, setWhatsAppOrderTarget] = useState<WhatsAppOrderTarget | null>(null);

  // "I WANT THIS" Buyer requests state
  const [wantedItems, setWantedItems] = useState<WantedItem[]>(() => getLocalWantedItems());
  const [isIWantThisOpen, setIsIWantThisOpen] = useState(false);

  // Cached + limit(20) Firestore sync (no full-collection download on boot)
  useEffect(() => {
    let cancelled = false;
    testConnection().catch(() => false);

    const cachedListings = getCachedListings();
    if (cachedListings && cachedListings.length > 0) {
      setIsLoadingListings(false);
    } else {
      fetchListingsPage(20)
        .then(({ items, lastDoc, hasMore }) => {
          if (cancelled) return;
          if (items && items.length > 0) {
            setListings((prev) => {
              const remoteMap = new Map(items.map((l) => [l.id, l]));
              const merged = [...items];
              prev.forEach((localItem) => {
                if (!remoteMap.has(localItem.id)) merged.push(localItem);
              });
              return merged;
            });
          }
          setListingsCursor(lastDoc);
          setHasMoreRemoteListings(hasMore);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setIsLoadingListings(false);
        });
    }

    fetchWantedItemsFromFirestore(20)
      .then((items) => {
        if (!cancelled && items && items.length > 0) {
          setWantedItems(items);
        }
      })
      .catch(() => {});

    fetchReviewsFromFirestore(20)
      .then((remoteReviews) => {
        if (!cancelled && remoteReviews) {
          setReviews(remoteReviews);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Track the last 5 listings clicked during the active browser session
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = sessionStorage.getItem('ogya_recent_views');
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          const all = getStoredListings();
          return ids
            .map((id) => all.find((item) => item.id === id))
            .filter((item): item is Listing => Boolean(item))
            .slice(0, 5);
        }
      }
    } catch {
      // ignore session reading errors
    }
    return [];
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    subcategory: 'all',
    region: 'all',
    minPrice: '',
    maxPrice: '',
    condition: 'all',
    onlyVerified: false,
    badgeFilter: 'all',
    sortBy: 'newest',
  });

  // Modals & Drawers state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<SellerInfo | null>(null);
  const [boostListing, setBoostListing] = useState<Listing | null>(null);
  const [chatListing, setChatListing] = useState<Listing | null>(null);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSellerDashboardOpen, setIsSellerDashboardOpen] = useState(false);
  const [fraudReportingListing, setFraudReportingListing] = useState<Listing | null>(null);
  const [reportTargetType, setReportTargetType] = useState<'listing' | 'user'>('listing');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalPage, setLegalModalPage] = useState<LegalPageId>('privacy');
  const [deletedAccountConfirmed, setDeletedAccountConfirmed] = useState(false);

  const openLegalPage = (page: LegalPageId) => {
    setLegalModalPage(page);
    setIsLegalModalOpen(true);
  };

  const buildReportListingFromProduct = (product: Product): Listing => ({
    id: product.id,
    title: product.name,
    price: product.price,
    currency: 'GHS',
    categoryId: 'accessories',
    categoryName: product.category || 'Store Product',
    subcategory: product.category || 'Product',
    condition: 'Brand New',
    location: 'Accra, Ghana',
    region: 'Greater Accra',
    description: product.description || product.name,
    images: product.imageUrl ? [product.imageUrl] : [],
    postedAt: 'Active',
    viewsCount: 0,
    likesCount: 0,
    isFeatured: false,
    isPromoted: false,
    isNegotiable: false,
    userId: product.sellerId || product.vendorId,
    seller: {
      name: product.vendorName || 'OGYA Vendor',
      isVerified: true,
      memberSince: '2026',
      phone: '+233 24 000 0000',
      whatsapp: '+233 24 000 0000',
      rating: 4.9,
      reviewCount: 1,
      responseTime: 'Under 15 mins',
      location: 'Accra, Ghana',
    },
  });

  // Ghana Courier Services State
  const [isCourierHubOpen, setIsCourierHubOpen] = useState(false);
  const [isCourierOrderOpen, setIsCourierOrderOpen] = useState(false);
  const [courierOrderListing, setCourierOrderListing] = useState<Listing | null>(null);
  const [trackedCourierOrder, setTrackedCourierOrder] = useState<CourierOrder | null>(null);

  const handleOpenCourierHub = () => {
    setIsCourierHubOpen(true);
  };

  const handleOpenCourierOrder = (listing?: Listing | null) => {
    setCourierOrderListing(listing || null);
    setIsCourierOrderOpen(true);
  };

  const handleOpenCourierTracking = (order: CourierOrder) => {
    setIsCourierHubOpen(false);
    setTrackedCourierOrder(order);
  };

  const handleCourierOrderSuccess = (order: CourierOrder) => {
    setIsCourierOrderOpen(false);
    setTrackedCourierOrder(order);
    showToast(`🚚 Courier Dispatched! Waybill #${order.waybillNumber} · Keep OTP #${order.securityOtp} safe`);
  };

  // User Authentication & Profile state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'signin'>('register');
  const [authDefaultRole, setAuthDefaultRole] = useState<'buyer' | 'seller'>('buyer');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'my-ads' | 'orders' | 'reputation' | 'settings' | 'security'>('profile');
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);

  const handleOpenProfile = (tab: 'profile' | 'my-ads' | 'orders' | 'reputation' | 'settings' | 'security' = 'profile') => {
    setProfileInitialTab(tab);
    setIsProfileOpen(true);
  };

  // Products, Cart, Vendors & Orders State (5-min cached + limit(20) paginated)
  const [products, setProducts] = useState<Product[]>(() => getCachedProducts() || SEED_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(() => !getCachedProducts());
  const [productsCursor, setProductsCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreRemoteProducts, setHasMoreRemoteProducts] = useState<boolean>(false);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isBecomeVendorOpen, setIsBecomeVendorOpen] = useState(false);
  const [isVendorDashboardOpen, setIsVendorDashboardOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);

  const isVendor = currentUser?.userRole === 'vendor' || currentUser?.role === 'vendor' || Boolean(currentVendor);

  // Fetch initial 20 products using 5-minute cache
  useEffect(() => {
    let cancelled = false;
    const cached = getCachedProducts();
    if (cached && cached.length > 0) {
      setProducts(cached);
      setIsLoadingProducts(false);
      return;
    }

    fetchProductsPage(20)
      .then(({ items, lastDoc, hasMore }) => {
        if (cancelled) return;
        if (items && items.length > 0) {
          setProducts(items);
        }
        setProductsCursor(lastDoc);
        setHasMoreRemoteProducts(hasMore);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadMoreProducts = async () => {
    if (isLoadingMoreProducts || !hasMoreRemoteProducts || !productsCursor) return;
    setIsLoadingMoreProducts(true);
    try {
      const { items, lastDoc, hasMore } = await fetchProductsPage(20, productsCursor);
      if (items.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          return [...prev, ...items.filter((it) => !existingIds.has(it.id))];
        });
      }
      setProductsCursor(lastDoc);
      setHasMoreRemoteProducts(hasMore);
    } finally {
      setIsLoadingMoreProducts(false);
    }
  };

  const handleLoadMoreListings = async () => {
    setVisibleListingsCount((prev) => prev + 20);
    if (hasMoreRemoteListings && listingsCursor && !isLoadingMoreListings) {
      setIsLoadingMoreListings(true);
      try {
        const { items, lastDoc, hasMore } = await fetchListingsPage(20, listingsCursor);
        if (items.length > 0) {
          setListings((prev) => {
            const existingIds = new Set(prev.map((l) => l.id));
            return [...prev, ...items.filter((it) => !existingIds.has(it.id))];
          });
        }
        setListingsCursor(lastDoc);
        setHasMoreRemoteListings(hasMore);
      } finally {
        setIsLoadingMoreListings(false);
      }
    }
  };

  // Keep currentUser synchronized with real Firebase Auth session (null for guests)
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((fbUser) => {
      if (fbUser) {
        const synced = syncUserProfileFromFirebaseAuth(fbUser);
        setCurrentUser(synced);
        ensureUserDocOnLogin(
          fbUser.uid,
          fbUser.email || undefined,
          fbUser.phoneNumber || undefined,
          fbUser.displayName || undefined
        ).catch(() => {});
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch vendor status for currentUser
  useEffect(() => {
    if (currentUser?.id && auth.currentUser) {
      fetchVendorByOwnerId(currentUser.id).then((v) => {
        setCurrentVendor(v);
      });
    } else {
      setCurrentVendor(null);
    }
  }, [currentUser]);

  const handleAddToCart = (product: Product, quantity = 1) => {
    const updated = addToCart(product, quantity);
    setCart(updated);
    showToast(`🛒 Added ${quantity > 1 ? `${quantity}x ` : ''}"${product.name.slice(0, 30)}..." to your Cart!`);
  };

  const handleAddFoodToCart = (item: FoodMenuItem, vendor: FoodVendor) => {
    const foodProduct: Product = {
      id: item.id,
      name: `${item.name} (${vendor.name})`,
      description: item.description,
      price: item.price,
      category: 'Ghanaian Food',
      imageUrl: item.imageUrl,
      stock: 99,
      vendorId: vendor.id,
      vendorName: vendor.name,
    };
    const updated = addToCart(foodProduct, 1);
    setCart(updated);
    showToast(`🍲 Added "${item.name}" from ${vendor.name} to cart (₵ ${item.price.toFixed(2)})!`);
  };

  const handleAddToCartFromListing = (listing: Listing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const storeProduct: Product = {
      id: listing.id,
      name: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.categoryName,
      imageUrl: listing.images?.[0] || '',
      stock: 50,
      vendorId: listing.userId || 'vnd-verified-ghana',
      vendorName: listing.seller?.name || 'OGYA Verified Vendor',
    };
    handleAddToCart(storeProduct, 1);
  };

  const getItemQuantityInCart = (itemId: string) => {
    const match = cart.find((c) => c.id === itemId);
    return match ? match.quantity : 0;
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const updated = updateCartQuantity(productId, quantity);
    setCart(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updated = removeFromCart(productId);
    setCart(updated);
    showToast('Item removed from cart.');
  };

  const handleClearCart = () => {
    clearCart();
    setCart([]);
    showToast('Cart cleared.');
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    clearCart();
    setCart([]);
    showToast('Order Placed');
  };

  const openWhatsAppOrderForProduct = (product: Product) => {
    setWhatsAppOrderTarget({
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      sellerId: product.sellerId || product.vendorId,
      vendorId: product.vendorId || product.sellerId || 'vnd-ogya',
      sellerName: product.vendorName || 'OGYA Verified Seller',
      sellerPhone: product.sellerWhatsapp || product.sellerPhone || '+233 24 412 3456',
      sellerLocation: product.sellerLocation || product.location || 'Accra',
      isVerified: product.isVerified,
    });
  };

  const openWhatsAppOrderForListing = (listing: Listing) => {
    setWhatsAppOrderTarget({
      productId: listing.id,
      productName: listing.title,
      price: listing.price,
      category: listing.categoryName,
      imageUrl: listing.images?.[0] || listing.imageUrl || '',
      sellerId: listing.sellerId || listing.userId,
      vendorId: listing.userId || listing.sellerId || 'vnd-ogya',
      sellerName: listing.seller?.name || 'OGYA Seller',
      sellerPhone: listing.seller?.whatsapp || listing.seller?.phone || '+233 24 412 3456',
      sellerLocation: listing.location || listing.seller?.location || 'Accra',
      isVerified: isListingSellerVerified(listing),
    });
  };

  const resolveRouteFromWindow = (): string => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page')?.toLowerCase();

    if (path === '/vendor' || path === '/vendor/' || hash === '#vendor' || pageParam === 'vendor') {
      return '/vendor';
    }
    if (
      path === '/become-verified' ||
      path === '/become-verified/' ||
      hash === '#become-verified' ||
      pageParam === 'become-verified'
    ) {
      return '/become-verified';
    }
    if (path === '/privacy' || path === '/privacy-policy' || hash === '#privacy' || pageParam === 'privacy') {
      return '/privacy';
    }
    if (path === '/terms' || path === '/terms-of-service' || hash === '#terms' || pageParam === 'terms') {
      return '/terms';
    }
    if (
      path === '/refund-policy' ||
      path === '/escrow' ||
      path === '/escrow-policy' ||
      hash === '#refund-policy' ||
      hash === '#escrow' ||
      pageParam === 'escrow' ||
      pageParam === 'refund-policy'
    ) {
      return '/refund-policy';
    }
    if (path === '/safe-trading' || path === '/safety' || hash === '#safety' || pageParam === 'safety') {
      return '/safe-trading';
    }
    return '/';
  };

  // Routing state for /vendor, /become-verified, /privacy, /terms, /refund-policy, or marketplace /
  const [currentPath, setCurrentPath] = useState<string>(() => resolveRouteFromWindow());

  const navigateToVendor = () => {
    setCurrentPath('/vendor');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/vendor');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBecomeVerified = () => {
    setCurrentPath('/become-verified');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/become-verified');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentPath('/');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLegalPage = (page: LegalPageId) => {
    const routeMap: Record<LegalPageId, string> = {
      privacy: '/privacy',
      terms: '/terms',
      escrow: '/refund-policy',
      safety: '/safe-trading',
    };
    const nextPath = routeMap[page] || '/privacy';
    setCurrentPath(nextPath);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Support direct deep links to /vendor, /privacy, /terms, /refund-policy, Cart or Checkout
  useEffect(() => {
    const handleLocationChange = () => {
      try {
        setCurrentPath(resolveRouteFromWindow());

        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view')?.toLowerCase();
        const cartParam = params.get('cart');
        const checkoutParam = params.get('checkout');
        if (hash === '#cart' || view === 'cart' || cartParam === 'true' || cartParam === 'open') {
          setIsCartOpen(true);
        } else if (hash === '#checkout' || view === 'checkout' || checkoutParam === 'true' || checkoutParam === 'open') {
          setIsCheckoutOpen(true);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleVendorCreated = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: 'vendor',
        userRole: 'vendor',
        businessName: vendor.shopName,
      });
    }
    showToast(`🎉 Congratulations! ${vendor.shopName} is now registered in 'vendors'.`);
    navigateToVendor();
  };

  const handleScrollToMarketplace = () => {
    const el = document.getElementById('browse-listings');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAuth = (
    mode: 'register' | 'signin' = 'register',
    defaultRole: 'buyer' | 'seller' = 'buyer'
  ) => {
    setAuthMode(mode);
    setAuthDefaultRole(defaultRole);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: UserProfile, msg: string) => {
    setCurrentUser(user);
    showToast(msg);
  };

  const handleSubscriptionSuccess = (updatedUser: UserProfile, msg: string) => {
    setCurrentUser(updatedUser);
    setListings((prev) =>
      prev.map((item) => {
        if (
          item.userId === updatedUser.id ||
          item.sellerId === updatedUser.id ||
          item.seller.name.toLowerCase().trim() === updatedUser.name.toLowerCase().trim()
        ) {
          return {
            ...item,
            seller: {
              ...item.seller,
              isVerified: true,
              isSubscribedVerified: true,
              ghanaCardVerified: true,
              verifiedPlan: 'Verified Seller (GH₵50)',
            },
          };
        }
        return item;
      })
    );
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sellerId === updatedUser.id || p.vendorId === updatedUser.id) {
          return { ...p, isVerified: true };
        }
        return p;
      })
    );
    showToast(msg);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('You have been signed out.');
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setCurrentUser(updated);
    showToast('Your profile has been updated.');
  };

  const handleListingUpdated = (updatedListing: Listing) => {
    setListings((prev) =>
      prev.map((item) => (item.id === updatedListing.id ? updatedListing : item))
    );
    if (selectedListing?.id === updatedListing.id) {
      setSelectedListing(updatedListing);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const recordListingView = (listing: Listing) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== listing.id);
      const next = [listing, ...filtered].slice(0, 5);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('ogya_recent_views', JSON.stringify(next.map((item) => item.id)));
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleOpenListing = (listing: Listing) => {
    setSelectedListing(listing);
    recordListingView(listing);
  };

  const handleClearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('ogya_recent_views');
      }
    } catch {
      // ignore
    }
    showToast('Recently viewed items cleared for this session');
  };

  // Deep-link support: open listing specified in URL params (from Web Share API or external links)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('listingId') || params.get('ad');
      if (targetId) {
        const found = listings.find((item) => item.id === targetId);
        if (found) {
          setSelectedListing(found);
          recordListingView(found);
        }
      }
    } catch {
      // ignore
    }
  }, [listings]);

  // Keep browser URL search param in sync when selectedListing opens or closes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedListing) {
        url.searchParams.set('listingId', selectedListing.id);
      } else {
        url.searchParams.delete('listingId');
        url.searchParams.delete('ad');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, [selectedListing]);

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleSaveListingId(id);
    setSavedIds(updated);
    const item = listings.find((l) => l.id === id);
    if (item) {
      const isNowSaved = updated.includes(id);
      showToast(isNowSaved ? `Added "${item.title.slice(0, 24)}..." to Saved Ads` : `Removed from Saved Ads`);
    }
  };

  const handleTogglePriceAlert = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { updated, added } = togglePriceAlertId(id);
    setPriceAlerts(updated);
    const item = listings.find((l) => l.id === id);
    const itemTitle = item ? item.title.slice(0, 26) : 'Item';
    if (added) {
      showToast(`🔔 Price drop alert activated for "${itemTitle}..."! We'll notify you when the price drops.`);
    } else {
      showToast(`Price drop alert removed for "${itemTitle}..."`);
    }
  };

  const handleBoostSuccess = (listingId: string, planName: string, durationDays: number = 7) => {
    markListingAsBoosted(listingId);
    updateStoredListing(listingId, {
      isPromoted: true,
      boostPlan: planName,
      promotedUntil: new Date(Date.now() + durationDays * 86400000).toISOString(),
    });
    setListings((prev) => {
      const targetIndex = prev.findIndex((item) => item.id === listingId);
      if (targetIndex === -1) return prev;
      const targetItem = {
        ...prev[targetIndex],
        isPromoted: true,
        boostPlan: planName,
        promotedUntil: new Date(Date.now() + durationDays * 86400000).toISOString(),
      };
      // Move promoted item to index 0 (top of feed)
      const remaining = prev.filter((item) => item.id !== listingId);
      return [targetItem, ...remaining];
    });
    const target = listings.find((l) => l.id === listingId);
    const title = target ? target.title.slice(0, 26) : 'Your Ad';
    showToast(`🚀 "${title}..." is now Promoted via Paystack (50 GHS) and pinned to the very top of the feed for ${durationDays} days!`);
  };

  const handleFilterUpdate = (updates: Partial<FilterState>) => {
    setVisibleListingsCount(20);
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setVisibleListingsCount(20);
    setFilters({
      searchQuery: '',
      category: 'all',
      subcategory: 'all',
      region: 'all',
      minPrice: '',
      maxPrice: '',
      condition: 'all',
      onlyVerified: false,
      badgeFilter: 'all',
      sortBy: 'newest',
    });
  };

  const handleSelectCategory = (catId: CategoryId | 'all') => {
    setVisibleListingsCount(20);
    setFilters((prev) => ({
      ...prev,
      category: catId,
      subcategory: 'all',
    }));
  };

  const handleQuickTagClick = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: tag,
      category: 'all',
      subcategory: 'all',
    }));
    showToast(`Showing popular results for "${tag}" 🔥`);
    setTimeout(() => {
      const el = document.getElementById('browse-listings') || document.querySelector('main');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const handleAdCreated = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
    showToast(`Ad "${newListing.title.slice(0, 30)}..." published successfully!`);
    handleOpenListing(newListing);
  };

  // Compute category counts across listings & store products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: listings.length + products.length };
    CATEGORIES.forEach((cat) => {
      const listingCount = listings.filter((item) => {
        if (cat.id === 'laptops') {
          return (
            item.categoryId === 'laptops' ||
            item.subcategory.toLowerCase().includes('laptop') ||
            item.title.toLowerCase().includes('macbook')
          );
        }
        if (cat.id === 'accessories') {
          return (
            item.categoryId === 'accessories' ||
            item.subcategory.toLowerCase().includes('accessor') ||
            item.subcategory.toLowerCase().includes('auto parts')
          );
        }
        return item.categoryId === cat.id;
      }).length;
      const storeCount = products.filter((p) => matchesProductCategoryFilter(p, cat.id)).length;
      counts[cat.id] = listingCount + storeCount;
    });
    return counts;
  }, [listings, products]);

  // Filtered listings
  const filteredListings = useMemo(() => {
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

        // Location filter across Ghana (All, Accra, Amasaman, Madina, Kasoa, Kumasi, Tema, Legon & 16 regions)
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

        // Only verified (Supports Ghana Card verified or GH₵50 subscribed verified)
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
  }, [listings, filters]);

  // Saved listings list
  const savedListings = useMemo(() => {
    return listings.filter((item) => savedIds.includes(item.id));
  }, [listings, savedIds]);

  const currentCategoryInfo = CATEGORIES.find((c) => c.id === filters.category);

  // Dedicated standalone Legal Pages (/privacy, /terms, /refund-policy, /safe-trading)
  if (
    currentPath === '/privacy' ||
    currentPath === '/terms' ||
    currentPath === '/refund-policy' ||
    currentPath === '/safe-trading'
  ) {
    const activeLegalPage: LegalPageId =
      currentPath === '/terms'
        ? 'terms'
        : currentPath === '/refund-policy'
        ? 'escrow'
        : currentPath === '/safe-trading'
        ? 'safety'
        : 'privacy';

    return (
      <>
        <SplashScreen />
        <Suspense fallback={<PageLoadingSkeleton />}>
          <LegalPageView
            page={activeLegalPage}
            onSelectPage={navigateToLegalPage}
            onNavigateHome={navigateToHome}
          />
        </Suspense>
        <PWAInstallBanner />
      </>
    );
  }

  // Dedicated Become Verified - GH₵50 Page (/become-verified)
  if (currentPath === '/become-verified') {
    return (
      <>
        <SplashScreen />
        <Suspense fallback={<PageLoadingSkeleton />}>
          <BecomeVerifiedPage
            currentUser={currentUser}
            onNavigateHome={navigateToHome}
            onOpenAuth={handleOpenAuth}
            onVerificationSuccess={(updatedUser, message) => {
              handleSubscriptionSuccess(updatedUser, message);
            }}
          />
          {isAuthOpen && (
            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
              initialMode={authMode}
              defaultRole={authDefaultRole}
              onAuthSuccess={handleAuthSuccess}
              onOpenLegalPage={openLegalPage}
            />
          )}
          {isLegalModalOpen && (
            <LegalPagesModal
              isOpen={isLegalModalOpen}
              initialPage={legalModalPage}
              onClose={() => setIsLegalModalOpen(false)}
            />
          )}
        </Suspense>
        <PWAInstallBanner />
      </>
    );
  }

  // If on /vendor page, render the full-page Vendor Dashboard + AuthModal so sellers can sign in directly
  if (currentPath === '/vendor') {
    return (
      <>
        <SplashScreen />
        <Suspense fallback={<PageLoadingSkeleton />}>
          <VendorDashboardPage
            currentUser={currentUser}
            vendor={currentVendor}
            onNavigateHome={navigateToHome}
            onOpenAuth={handleOpenAuth}
            onOpenBecomeVerified={navigateToBecomeVerified}
          />
          {isAuthOpen && (
            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
              initialMode={authMode}
              defaultRole={authDefaultRole}
              onAuthSuccess={handleAuthSuccess}
              onOpenLegalPage={openLegalPage}
            />
          )}
          {isLegalModalOpen && (
            <LegalPagesModal
              isOpen={isLegalModalOpen}
              initialPage={legalModalPage}
              onClose={() => setIsLegalModalOpen(false)}
            />
          )}
        </Suspense>
        <PWAInstallBanner />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#F8F9FA] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 pb-20 sm:pb-0">
      <SplashScreen />
      <PWAInstallBanner />
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 dark:bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 border border-slate-800 dark:border-slate-700">
          <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header with Global Dark Mode Toggle */}
      <Header
        onGoHome={() => {
          handleResetFilters();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPostAd={() => {
          if (!currentUser) {
            handleOpenAuth('register', 'seller');
            showToast('Please sign in or create a Seller account to post products.');
          } else {
            setIsPostAdOpen(true);
          }
        }}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenSafety={() => setIsSafetyOpen(true)}
        onOpenCourierHub={handleOpenCourierHub}
        onSelectCategory={(id) => handleSelectCategory(id as CategoryId)}
        savedCount={savedIds.length}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => handleOpenProfile('profile')}
        onOpenSellerDashboard={() => {
          if (!currentUser) {
            handleOpenAuth('signin', 'seller');
            showToast('Please sign in as a Seller to access your dashboard.');
          } else {
            setIsSellerDashboardOpen(true);
          }
        }}
        onOpenVerifiedSubscription={navigateToBecomeVerified}
        onLogout={handleLogout}
        cartCount={getCartItemCount(cart)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMyOrders={() => {
          if (!currentUser || !auth.currentUser) {
            setIsMyOrdersOpen(true);
          } else {
            handleOpenProfile('orders');
          }
        }}
        onOpenBecomeVendor={() => setIsBecomeVendorOpen(true)}
        onOpenVendorDashboard={navigateToVendor}
        isVendor={isVendor}
        onOpenIWantThis={() => setIsIWantThisOpen(true)}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleFilterUpdate({ searchQuery: q })}
        onExecuteSearch={(q) => {
          if (q !== undefined) handleFilterUpdate({ searchQuery: q });
          setTimeout(() => {
            const el = document.getElementById('browse-listings') || document.querySelector('main');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onOpenSettings={() => {
          if (currentUser) {
            handleOpenProfile('settings');
          } else {
            openLegalPage('privacy');
          }
        }}
      />

      {/* Category Navigation Bar for 17 Sectors */}
      <CategoryNav
        selectedCategory={filters.category}
        onSelectCategory={handleSelectCategory}
        categoryCounts={categoryCounts}
      />

      {/* Hero Showcase with Unified Search & Big Orange I WANT THIS CTA */}
      <HeroBanner
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleFilterUpdate({ searchQuery: q })}
        selectedCategory={filters.category}
        onCategoryChange={(c) => handleFilterUpdate({ category: c, subcategory: 'all' })}
        selectedRegion={filters.region}
        onRegionChange={(r) => handleFilterUpdate({ region: r })}
        onQuickTagClick={handleQuickTagClick}
        onOpenCourierHub={handleOpenCourierHub}
        onOpenIWantThis={() => setIsIWantThisOpen(true)}
      />

      {/* Trust & Safe Verification Strip */}
      <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap min-w-0">
            <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-semibold">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span>100% Direct Seller &amp; Recruiter Contacts</span>
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Zero Broker Commissions</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleOpenCourierHub}
              className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer text-left"
            >
              <span>🚚 Door Courier Across Ghana (16 Regions)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <button
              onClick={() => setIsIWantThisOpen(true)}
              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 font-black flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>🔥 Post What You Want</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
            </button>
            <button
              onClick={handleOpenCourierHub}
              className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Dispatch Courier</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
            </button>
            <button
              onClick={() => setIsSafetyOpen(true)}
              className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              Read Safe Trade Advice
            </button>
          </div>
        </div>
      </div>

      {/* "Buyers Want" Feed on Homepage (Live Buyer Demands & WhatsApp Connections) */}
      <Suspense fallback={<SectionSkeleton titleWidth="w-48" cardCount={4} />}>
        <BuyersWantFeed
          wantedItems={wantedItems}
          onOpenIWantThis={() => setIsIWantThisOpen(true)}
        />
      </Suspense>

      {/* Featured Food Vendors in Accra (shown on All & Food tabs) */}
      {(filters.category === 'all' || filters.category === 'food') && (
        <Suspense fallback={<SectionSkeleton titleWidth="w-64" cardCount={3} />}>
          <FoodVendorsSection
            onAddToCart={handleAddFoodToCart}
            cartItemCount={getCartItemCount(cart)}
            getItemQuantityInCart={getItemQuantityInCart}
            searchQuery={filters.searchQuery}
          />
        </Suspense>
      )}

      {/* Home Location Filter Bar (All, Accra, Amasaman, Madina, Kasoa, Kumasi, Tema, Legon) */}
      <section className="bg-slate-950 border-b border-slate-800/90 py-3">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <MapPin size={15} className="text-[#FF6600]" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Shop by Location
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pb-0.5">
            {HOME_LOCATIONS.map((loc) => {
              const targetValue = loc === 'All' ? 'all' : loc;
              const isSelected =
                filters.region === targetValue ||
                (loc === 'All' &&
                  (filters.region === 'all' ||
                    filters.region === 'All Regions' ||
                    filters.region === 'All Ghana'));
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleFilterUpdate({ region: targetValue })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FF6600] text-white border-[#FF6600] shadow-xs'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-[#F59E0B]/60 hover:text-white'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* General Marketplace Store Products Organized by Category (Food, Phones, Laptops, Cars, Accessories, Fashion, Home Items, Electronics) */}
      <Suspense fallback={<SectionSkeleton titleWidth="w-60" cardCount={8} />}>
        <StoreProductsSection
          products={products}
          selectedCategory={filters.category}
          selectedLocation={filters.region}
          searchQuery={filters.searchQuery}
          reviews={reviews}
          isLoading={isLoadingProducts}
          hasMore={hasMoreRemoteProducts}
          isLoadingMore={isLoadingMoreProducts}
          onLoadMore={handleLoadMoreProducts}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onOrderWhatsApp={(p) => openWhatsAppOrderForProduct(p)}
          onSelectCategory={handleSelectCategory}
          onReportProduct={(product) => {
            setReportTargetType('listing');
            setFraudReportingListing(buildReportListingFromProduct(product));
          }}
        />
      </Suspense>

      {/* Main Content Area: Sidebar Filters + Listings Grid */}
      <main id="browse-listings" className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full min-w-0 scroll-mt-20">
        {/* Mobile & Tablet Filter Toggle & Quick Recent Badge (<= 1024px) */}
        <div className="min-[1025px]:hidden mb-4 flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {filteredListings.length} results
            </span>
            {recentlyViewed.length > 0 && (
              <a
                href="#recently-viewed"
                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50 flex items-center gap-1 hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                <span>🕒 Recent ({recentlyViewed.length})</span>
              </a>
            )}
          </div>
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap"
          >
            <SlidersHorizontal size={14} />
            <span>{showMobileFilter ? 'Hide Filters' : 'Filter & Sort'}</span>
          </button>
        </div>

        {/* Mobile & Tablet Filter Drawer / Collapsible Box */}
        {showMobileFilter && (
          <div className="min-[1025px]:hidden mb-6 space-y-4">
            <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />}>
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterUpdate}
                onResetFilters={handleResetFilters}
                totalResults={filteredListings.length}
              />

              {recentlyViewed.length > 0 && (
                <RecentlyViewed
                  items={recentlyViewed}
                  onOpenDetails={handleOpenListing}
                  onToggleSave={handleToggleSave}
                  savedIds={savedIds}
                  onClear={handleClearRecentlyViewed}
                  variant="sidebar"
                />
              )}
            </Suspense>
          </div>
        )}

        <div className="grid grid-cols-1 min-[1025px]:grid-cols-4 gap-6 min-[1025px]:gap-8 items-start">
          {/* Desktop Left Sidebar: Filters & Session Recently Viewed Widget (> 1024px) */}
          <aside className="hidden min-[1025px]:block min-[1025px]:col-span-1 sticky top-20 space-y-6">
            <Suspense fallback={<div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />}>
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterUpdate}
                onResetFilters={handleResetFilters}
                totalResults={filteredListings.length}
              />

              {recentlyViewed.length > 0 && (
                <RecentlyViewed
                  items={recentlyViewed}
                  onOpenDetails={handleOpenListing}
                  onToggleSave={handleToggleSave}
                  savedIds={savedIds}
                  onClear={handleClearRecentlyViewed}
                  variant="sidebar"
                />
              )}
            </Suspense>
          </aside>

          {/* Right 3 Columns on Desktop, Full Width on Phone/Tablet */}
          <section className="min-[1025px]:col-span-3 min-w-0 space-y-5 sm:space-y-6">
            {/* Sector Heading & Result Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="min-w-0">
                <h2 className="text-[clamp(1.15rem,3vw,1.5rem)] font-black text-slate-950 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>{currentCategoryInfo ? currentCategoryInfo.name : '🔥 Top Marketplace Listings'}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#FF6600] border border-orange-200 dark:border-orange-900/50">
                    {filteredListings.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentCategoryInfo ? currentCategoryInfo.shortDesc : 'Jiji + Tonaton + Jumia style marketplace for Vehicles, Phones, Electronics, Property, Food, Jobs & Services across Ghana.'}
                </p>
              </div>

              {/* Active Filter Pills (Interactive button elements to clear) */}
              {(filters.category !== 'all' || filters.searchQuery || filters.condition !== 'all' || (filters.region !== 'all' && filters.region !== 'All Regions' && filters.region !== 'All Ghana') || (filters.badgeFilter && filters.badgeFilter !== 'all')) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.category !== 'all' && (
                    <button
                      onClick={() => handleFilterUpdate({ category: 'all', subcategory: 'all' })}
                      className="text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 border border-slate-300/50 dark:border-slate-700"
                    >
                      <span>{currentCategoryInfo?.name}</span>
                      <span className="font-bold">×</span>
                    </button>
                  )}
                  {filters.badgeFilter && filters.badgeFilter !== 'all' && (
                    <button
                      onClick={() => handleFilterUpdate({ badgeFilter: 'all' })}
                      className="text-xs bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Award size={12} className="text-amber-600 dark:text-amber-400" />
                      <span>{BADGE_DEFINITIONS[filters.badgeFilter]?.label}</span>
                      <span className="font-bold">×</span>
                    </button>
                  )}
                  {filters.searchQuery && (
                    <button
                      onClick={() => handleFilterUpdate({ searchQuery: '' })}
                      className="text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 border border-slate-300/50 dark:border-slate-700"
                    >
                      <span>"{filters.searchQuery}"</span>
                      <span className="font-bold">×</span>
                    </button>
                  )}
                  {filters.region !== 'all' && filters.region !== 'All Regions' && filters.region !== 'All Ghana' && (
                    <button
                      onClick={() => handleFilterUpdate({ region: 'all' })}
                      className="text-xs bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 border border-amber-300/70 dark:border-amber-800"
                    >
                      <span>📍 {filters.region.split('(')[0].trim()}</span>
                      <span className="font-bold">×</span>
                    </button>
                  )}
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Jiji/Tonaton Quick Location & Price Sort Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              {/* Location Row: Accra, Kumasi, Tema, Takoradi, Tamale, Cape Coast */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                  <span>📍</span>
                  <span>Filter Location:</span>
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  {HOME_LOCATIONS.map((loc) => {
                    const value = loc === 'All' ? 'all' : loc;
                    const isSelected =
                      filters.region === value ||
                      (value === 'all' &&
                        (filters.region === 'all' ||
                          filters.region === 'All Regions' ||
                          filters.region === 'All Ghana'));
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleFilterUpdate({ region: value })}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF6600] text-white shadow-xs font-black'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & Deals Sort Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                  <span>⚡</span>
                  <span>Sort By:</span>
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  {[
                    { label: 'Newest First', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price-low' },
                    { label: 'Price: High to Low', value: 'price-high' },
                    { label: '⭐ Top Rated', value: 'top-rated' },
                    { label: 'Most Popular', value: 'popular' },
                  ].map((s) => {
                    const isSelected = filters.sortBy === s.value;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => handleFilterUpdate({ sortBy: s.value as any })}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Vendor card at top of Phone Accessories: Daniel Arnan Aboagye */}
            {(filters.category === 'phones-tablets' ||
              filters.category === 'accessories' ||
              filters.subcategory === 'Phone Accessories' ||
              filters.searchQuery.toLowerCase().includes('daniel') ||
              filters.searchQuery.toLowerCase().includes('accessories')) && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-lg border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-xl text-amber-400 shrink-0 shadow-inner">
                    📱
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        Daniel Arnan Aboagye
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                        <CheckCircle2 size={12} />
                        VERIFIED SELLER - Amasaman Taxi Rank
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 font-semibold mt-1">
                      📍 Amasaman Taxi Rank, Accra · Prices <strong>GH₵ 50 to GH₵ 150</strong> — <em>"One can get anything from him"</em>
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Earbuds, JBL Headphones, Fancy Cases with Beads, 120W Fast Chargers, EarPods, Tempered Glass Bundles.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <a
                    href="https://wa.me/233549769720?text=Hello%20Daniel%20I%20saw%20your%20accessories%20on%20OGYA%20FIRE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    <span>💬</span>
                    <span>Chat Daniel on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Grid of Listings with Loading Skeleton & limit(20) Pagination */}
            {isLoadingListings && listings.length === 0 ? (
              <ProductGridSkeleton count={8} variant="listings" />
            ) : filteredListings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs animate-in fade-in duration-200">
                <AlertCircle size={48} className="mx-auto text-amber-500 mb-3 stroke-1" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1.5">
                  {filters.searchQuery
                    ? `No results for "${filters.searchQuery}" - Try Waakye, Jollof`
                    : 'No Listings Match Your Selected Criteria'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
                  {filters.searchQuery ? (
                    <span>
                      We couldn't find items matching "<strong>{filters.searchQuery}</strong>". Try these popular Ghana searches:
                    </span>
                  ) : (
                    'Try broadening your price range, searching for a different keyword, or resetting your location/category filter.'
                  )}
                </p>

                {/* Popular suggestion chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  {['Waakye', 'Jollof', 'Tilapia', 'iPhone', 'Kente Cloth'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleFilterUpdate({ searchQuery: term })}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <span>{term}</span>
                      <span className="text-amber-500">🔥</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => setIsPostAdOpen(true)}
                    className="px-4 py-2 bg-[#FF6600] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={15} />
                    <span>Post This Item For Sale</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 min-[1025px]:grid-cols-4 gap-2.5 sm:gap-4 min-[1025px]:gap-5">
                  {filteredListings.slice(0, visibleListingsCount).map((item) => (
                    <ListingCard
                      key={item.id}
                      listing={item}
                      isSaved={savedIds.includes(item.id)}
                      onToggleSave={handleToggleSave}
                      onOpenDetails={(listing) => handleOpenListing(listing)}
                      hasPriceAlert={priceAlerts.includes(item.id)}
                      onTogglePriceAlert={handleTogglePriceAlert}
                      onOpenSellerProfile={(seller) => setSelectedSeller(seller)}
                      onOpenBoost={(item, e) => {
                        e.stopPropagation();
                        setBoostListing(item);
                      }}
                      onReportListing={(item) => {
                        setReportTargetType('listing');
                        setFraudReportingListing(item);
                      }}
                      onAddToCart={handleAddToCartFromListing}
                      onOrderWhatsApp={(listing, e) => {
                        e.stopPropagation();
                        openWhatsAppOrderForListing(listing);
                      }}
                      reviews={reviews}
                    />
                  ))}
                </div>

                {(visibleListingsCount < filteredListings.length || hasMoreRemoteListings) && (
                  <div className="pt-4 flex flex-col items-center gap-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Showing {Math.min(visibleListingsCount, filteredListings.length)} of {filteredListings.length} listings
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadMoreListings}
                      disabled={isLoadingMoreListings}
                      className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-[#FF6600] hover:bg-slate-800 dark:hover:bg-orange-600 text-white text-xs font-black transition-all cursor-pointer shadow-sm disabled:opacity-60"
                    >
                      {isLoadingMoreListings ? 'Loading more listings...' : 'Load More Marketplace Listings (+20)'}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* Recently Viewed Section Below Main Feed */}
        <Suspense fallback={<div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse mt-8" />}>
          <RecentlyViewed
            items={recentlyViewed}
            onOpenDetails={handleOpenListing}
            onToggleSave={handleToggleSave}
            savedIds={savedIds}
            onClear={handleClearRecentlyViewed}
            variant="feed"
            onReportListing={(item) => {
              setReportTargetType('listing');
              setFraudReportingListing(item);
            }}
          />
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={<div className="h-48 bg-slate-950 animate-pulse mt-16" />}>
        <Footer
          onSelectCategory={handleSelectCategory}
          onOpenSafety={() => navigateToLegalPage('safety')}
          onOpenLegalPage={navigateToLegalPage}
          onOpenPostAd={() => setIsPostAdOpen(true)}
          onOpenAuth={handleOpenAuth}
          onOpenCourierHub={handleOpenCourierHub}
          onOpenVerifiedSubscription={navigateToBecomeVerified}
        />
      </Suspense>

      {/* Lazy-Loaded Modals & Drawers (Only fetched on demand when opened) */}
      <Suspense fallback={<ModalLoadingFallback />}>
        {selectedListing && (
          <ListingDetailModal
            listing={selectedListing}
            isOpen={Boolean(selectedListing)}
            onClose={() => setSelectedListing(null)}
            isSaved={savedIds.includes(selectedListing.id)}
            onToggleSave={handleToggleSave}
            onOpenChat={(listing) => {
              setSelectedListing(null);
              setChatListing(listing);
            }}
            hasPriceAlert={priceAlerts.includes(selectedListing.id)}
            onTogglePriceAlert={handleTogglePriceAlert}
            onOpenSellerProfile={(seller) => {
              setSelectedListing(null);
              setSelectedSeller(seller);
            }}
            onOpenBoost={(listing) => {
              setBoostListing(listing);
            }}
            onShareSuccess={showToast}
            onOrderCourier={(listing) => {
              setSelectedListing(null);
              handleOpenCourierOrder(listing);
            }}
            allListings={listings}
            onSelectListing={handleOpenListing}
            onAddToCart={(listing) => {
              handleAddToCartFromListing(listing);
              setIsCartOpen(true);
            }}
            onOrderWhatsApp={(listing) => {
              setSelectedListing(null);
              openWhatsAppOrderForListing(listing);
            }}
            reviews={reviews}
          />
        )}

        {boostListing && (
          <BoostAdModal
            listing={boostListing}
            isOpen={Boolean(boostListing)}
            onClose={() => setBoostListing(null)}
            onBoostSuccess={handleBoostSuccess}
          />
        )}

        {selectedSeller && (
          <SellerProfileModal
            seller={selectedSeller}
            isOpen={Boolean(selectedSeller)}
            onClose={() => setSelectedSeller(null)}
            allListings={listings}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onOpenListingDetails={(listing) => {
              setSelectedSeller(null);
              handleOpenListing(listing);
            }}
            priceAlerts={priceAlerts}
            onTogglePriceAlert={handleTogglePriceAlert}
            onOpenChatWithSeller={(listing) => {
              setSelectedSeller(null);
              setChatListing(listing);
            }}
            onOrderWhatsApp={(listing) => {
              setSelectedSeller(null);
              openWhatsAppOrderForListing(listing);
            }}
            onOpenBecomeVerified={() => {
              setSelectedSeller(null);
              navigateToBecomeVerified();
            }}
            reviews={reviews}
            onReportListing={(listing) => {
              setSelectedSeller(null);
              setReportTargetType('listing');
              setFraudReportingListing(listing);
            }}
            onReportSeller={(seller, sampleListing) => {
              setSelectedSeller(null);
              setReportTargetType('user');
              if (sampleListing) {
                setFraudReportingListing(sampleListing);
              } else {
                setFraudReportingListing({
                  id: `seller-report-${seller.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                  title: `${seller.name} (Seller Profile)`,
                  price: 0,
                  currency: 'GHS',
                  categoryId: 'services',
                  categoryName: 'Seller Account',
                  subcategory: 'Profile',
                  condition: 'Not Applicable',
                  location: seller.location || 'Ghana',
                  region: 'Greater Accra',
                  description: `Seller profile report for ${seller.name}`,
                  images: [],
                  postedAt: 'Active',
                  viewsCount: 0,
                  likesCount: 0,
                  isFeatured: false,
                  isPromoted: false,
                  isNegotiable: false,
                  seller,
                });
              }
            }}
          />
        )}

        {chatListing && (
          <ChatModal
            listing={chatListing}
            isOpen={Boolean(chatListing)}
            onClose={() => setChatListing(null)}
          />
        )}

        {isPostAdOpen && (
          <PostAdModal
            isOpen={isPostAdOpen}
            onClose={() => setIsPostAdOpen(false)}
            onAdCreated={handleAdCreated}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {isSavedOpen && (
          <SavedAdsDrawer
            isOpen={isSavedOpen}
            onClose={() => setIsSavedOpen(false)}
            savedListings={savedListings}
            onRemoveSaved={(id) => {
              const updated = toggleSaveListingId(id);
              setSavedIds(updated);
            }}
            onOpenDetails={(item) => handleOpenListing(item)}
            priceAlerts={priceAlerts}
            onTogglePriceAlert={handleTogglePriceAlert}
          />
        )}

        {isSafetyOpen && (
          <SafetyModal
            isOpen={isSafetyOpen}
            onClose={() => setIsSafetyOpen(false)}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialMode={authMode}
            defaultRole={authDefaultRole}
            onAuthSuccess={handleAuthSuccess}
            onOpenLegalPage={openLegalPage}
          />
        )}

        {isProfileOpen && (
          <UserProfileModal
            user={currentUser}
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onLogout={handleLogout}
            onOpenPostAd={() => setIsPostAdOpen(true)}
            allListings={listings}
            onOpenListing={handleOpenListing}
            onOpenBoost={(item) => setBoostListing(item)}
            onProfileUpdated={handleProfileUpdated}
            onListingUpdated={handleListingUpdated}
            initialTab={profileInitialTab}
            onOpenStore={() => {
              setIsProfileOpen(false);
              const el = document.getElementById('browse-listings') || document.querySelector('main');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenFoodVendors={() => {
              setIsProfileOpen(false);
              const el = document.getElementById('accra-food-vendors');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenCart={() => {
              setIsProfileOpen(false);
              setIsCartOpen(true);
            }}
            onOpenLegalPage={(page) => {
              setIsProfileOpen(false);
              navigateToLegalPage(page);
            }}
            onReviewCreated={(rev) => {
              setReviews((prev) => [rev, ...prev.filter((r) => r.id !== rev.id)]);
              showToast('Thank you! Your review has been published.');
            }}
            onAccountDeleted={(deletedUid) => {
              setCurrentUser(null);
              setCurrentVendor(null);
              setListings((prev) => prev.filter((l) => l.userId !== deletedUid && l.sellerId !== deletedUid));
              setProducts((prev) => prev.filter((p) => p.sellerId !== deletedUid && p.vendorId !== deletedUid));
              setIsProfileOpen(false);
              setIsSellerDashboardOpen(false);
              setDeletedAccountConfirmed(true);
              showToast('Your account and associated data have been permanently deleted.');
            }}
          />
        )}

        {currentUser && isSellerDashboardOpen && (
          <SellerDashboardModal
            isOpen={isSellerDashboardOpen}
            onClose={() => setIsSellerDashboardOpen(false)}
            currentUser={currentUser}
            allListings={listings}
            onOpenListing={handleOpenListing}
            onOpenPostAd={() => {
              setIsSellerDashboardOpen(false);
              setIsPostAdOpen(true);
            }}
            onOpenBoost={(item) => {
              setIsSellerDashboardOpen(false);
              setBoostListing(item);
            }}
            onOpenVerifiedSubscription={() => {
              setIsSellerDashboardOpen(false);
              setIsVerifiedModalOpen(true);
            }}
            onListingUpdated={handleListingUpdated}
            onProfileUpdated={handleProfileUpdated}
            onToast={showToast}
            onLogout={handleLogout}
            onOpenSettings={() => {
              setIsSellerDashboardOpen(false);
              handleOpenProfile('settings');
            }}
          />
        )}

        {fraudReportingListing && (
          <ReportListingModal
            isOpen={Boolean(fraudReportingListing)}
            onClose={() => setFraudReportingListing(null)}
            listing={fraudReportingListing}
            initialTarget={reportTargetType}
            onReportSuccess={(report) => {
              showToast(`🚨 Report #${report.referenceId} submitted. Trust & Safety team is investigating.`);
              setFraudReportingListing(null);
            }}
          />
        )}

        {isCourierHubOpen && (
          <CourierHubModal
            isOpen={isCourierHubOpen}
            onClose={() => setIsCourierHubOpen(false)}
            onOpenNewOrder={() => {
              setIsCourierHubOpen(false);
              handleOpenCourierOrder(null);
            }}
            onOpenTracking={handleOpenCourierTracking}
            onOpenSafetyGuide={() => {
              setIsCourierHubOpen(false);
              setIsSafetyOpen(true);
            }}
          />
        )}

        {isCourierOrderOpen && (
          <CourierOrderModal
            isOpen={isCourierOrderOpen}
            onClose={() => {
              setIsCourierOrderOpen(false);
              setCourierOrderListing(null);
            }}
            listing={courierOrderListing}
            currentUser={currentUser}
            onOrderSuccess={handleCourierOrderSuccess}
          />
        )}

        {trackedCourierOrder && (
          <CourierTrackingModal
            order={trackedCourierOrder}
            isOpen={Boolean(trackedCourierOrder)}
            onClose={() => setTrackedCourierOrder(null)}
            onOrderUpdated={(updated) => {
              setTrackedCourierOrder(updated);
              showToast(`Tracking status updated: ${updated.status.replace(/_/g, ' ')}`);
            }}
          />
        )}

        {isVerifiedModalOpen && (
          <VerifiedSubscriptionModal
            isOpen={isVerifiedModalOpen}
            onClose={() => setIsVerifiedModalOpen(false)}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('signin')}
            onSubscriptionSuccess={handleSubscriptionSuccess}
          />
        )}

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            isOpen={Boolean(selectedProduct)}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onOrderWhatsApp={(product) => {
              setSelectedProduct(null);
              openWhatsAppOrderForProduct(product);
            }}
            reviews={reviews}
            onReportProduct={(product) => {
              setSelectedProduct(null);
              setReportTargetType('listing');
              setFraudReportingListing(buildReportListingFromProduct(product));
            }}
          />
        )}

        {isLegalModalOpen && (
          <LegalPagesModal
            isOpen={isLegalModalOpen}
            initialPage={legalModalPage}
            onClose={() => setIsLegalModalOpen(false)}
          />
        )}

        {deletedAccountConfirmed && (
          <div
            className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setDeletedAccountConfirmed(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={26} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Account &amp; Data Permanently Deleted
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your OGYA account, profile details, store products, marketplace listings, and local session data have been permanently deleted.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeletedAccountConfirmed(false)}
                className="w-full py-2.5 px-4 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer"
              >
                Return to Marketplace
              </button>
            </div>
          </div>
        )}

        {isCartOpen && (
          <CartModal
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onProceedToCheckout={handleOpenCheckout}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            currentUser={currentUser}
            onOrderSuccess={handleOrderSuccess}
            onRequireAuth={() => handleOpenAuth('signin')}
          />
        )}

        {isMyOrdersOpen && (
          <MyOrdersModal
            isOpen={isMyOrdersOpen}
            onClose={() => setIsMyOrdersOpen(false)}
            currentUser={currentUser}
            onOpenStore={handleScrollToMarketplace}
            onReviewCreated={(rev) => {
              setReviews((prev) => [rev, ...prev.filter((r) => r.id !== rev.id)]);
              showToast('Thank you! Your review has been published.');
            }}
          />
        )}

        {whatsAppOrderTarget && (
          <WhatsAppOrderModal
            isOpen={Boolean(whatsAppOrderTarget)}
            onClose={() => setWhatsAppOrderTarget(null)}
            target={whatsAppOrderTarget}
            currentUser={currentUser}
            onOrderCreated={() => {
              showToast('WhatsApp order saved! Upload MoMo screenshot proof anytime in My Orders.');
            }}
            onOpenMyOrders={() => {
              setWhatsAppOrderTarget(null);
              if (currentUser && auth.currentUser) {
                handleOpenProfile('orders');
              } else {
                setIsMyOrdersOpen(true);
              }
            }}
          />
        )}

        {isBecomeVendorOpen && (
          <BecomeVendorModal
            isOpen={isBecomeVendorOpen}
            onClose={() => setIsBecomeVendorOpen(false)}
            currentUser={currentUser}
            onVendorCreated={handleVendorCreated}
            onOpenAuth={() => handleOpenAuth('signin')}
          />
        )}

        {isVendorDashboardOpen && (
          <VendorDashboardModal
            isOpen={isVendorDashboardOpen}
            onClose={() => setIsVendorDashboardOpen(false)}
            currentUser={currentUser}
            vendor={currentVendor}
            products={products}
            onProductUpdated={() => fetchProductsFromFirestore({ forceRefresh: true }).then(setProducts)}
            onOpenAuth={() => handleOpenAuth('signin', 'seller')}
          />
        )}

        {isIWantThisOpen && (
          <IWantThisModal
            isOpen={isIWantThisOpen}
            onClose={() => setIsIWantThisOpen(false)}
            onItemPosted={(item) => {
              setWantedItems((prev) => [item, ...prev.filter((w) => w.id !== item.id)]);
              showToast(`🔥 Request for "${item.item}" posted live to Ghana sellers!`);
            }}
          />
        )}
      </Suspense>

      {/* Fixed Mobile Bottom Navigation Bar (< 640px): Home, Marketplace, Search, Cart, Profile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-2xl">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
          {/* Tab 1: Home */}
          <button
            type="button"
            onClick={() => {
              handleResetFilters();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-700 dark:text-slate-300 hover:text-[#FF6600] dark:hover:text-orange-400 transition-colors cursor-pointer"
          >
            <Home size={20} />
            <span className="text-[10px] font-bold mt-1">Home</span>
          </button>

          {/* Tab 2: Marketplace */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('browse-listings') || document.querySelector('main');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-700 dark:text-slate-300 hover:text-[#FF6600] dark:hover:text-orange-400 transition-colors cursor-pointer"
          >
            <Store size={20} />
            <span className="text-[10px] font-bold mt-1">Marketplace</span>
          </button>

          {/* Tab 3: Search */}
          <button
            type="button"
            onClick={() => {
              const wrapper = document.getElementById('hero-search-wrapper');
              const input = document.getElementById('hero-search-input') as HTMLInputElement | null;
              if (wrapper) {
                wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              setTimeout(() => {
                input?.focus();
              }, 260);
            }}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[#FF6600] hover:text-orange-600 transition-colors cursor-pointer"
          >
            <Search size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black mt-1">Search</span>
          </button>

          {/* Tab 4: Cart */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-700 dark:text-slate-300 hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ShoppingCart size={20} />
            <span className="text-[10px] font-bold mt-1">Cart</span>
            {cart.length > 0 && (
              <span className="absolute top-1.5 right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#FF6600] text-white text-[9px] font-black flex items-center justify-center">
                {cart.reduce((sum, it) => sum + it.quantity, 0)}
              </span>
            )}
          </button>

          {/* Tab 5: Profile */}
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                handleOpenProfile('profile');
              } else {
                handleOpenAuth('signin');
              }
            }}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-700 dark:text-slate-300 hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <User size={20} />
            <span className="text-[10px] font-bold mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
