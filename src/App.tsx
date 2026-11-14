import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { HeroBanner } from './components/HeroBanner';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { ChatModal } from './components/ChatModal';
import { PostAdModal } from './components/PostAdModal';
import { SavedAdsDrawer } from './components/SavedAdsDrawer';
import { SafetyModal } from './components/SafetyModal';
import { FilterSidebar } from './components/FilterSidebar';
import { Footer } from './components/Footer';
import { SellerProfileModal } from './components/SellerProfileModal';
import { BoostAdModal } from './components/BoostAdModal';
import { RecentlyViewed } from './components/RecentlyViewed';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SellerDashboardModal } from './components/SellerDashboardModal';
import { ReportListingModal } from './components/ReportListingModal';
import { CourierHubModal } from './components/CourierHubModal';
import { CourierOrderModal } from './components/CourierOrderModal';
import { CourierTrackingModal } from './components/CourierTrackingModal';
import { VerifiedSubscriptionModal } from './components/VerifiedSubscriptionModal';
import { VercelDeployGuideModal } from './components/VercelDeployGuideModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { CheckoutModal } from './components/CheckoutModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { BecomeVendorModal } from './components/BecomeVendorModal';
import { VendorDashboardModal } from './components/VendorDashboardModal';
import { VendorDashboardPage } from './components/VendorDashboardPage';
import { FoodVendorsSection } from './components/FoodVendorsSection';
import { StoreProductsSection } from './components/StoreProductsSection';
import { IWantThisModal } from './components/IWantThisModal';
import { BuyersWantFeed } from './components/BuyersWantFeed';
import { FoodVendor, FoodMenuItem } from './data/foodVendors';
import { Product, Vendor, Order, CartItem, matchesProductCategoryFilter } from './types/store';
import { SEED_PRODUCTS } from './data/seedProducts';
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
} from './utils/cartStorage';
import { CourierOrder } from './types/courier';
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
  subscribeToListingsFromFirestore,
  fetchProductsFromFirestore,
  subscribeToProductsFromFirestore,
  fetchVendorByOwnerId,
  subscribeToWantedItemsFromFirestore,
  getLocalWantedItems,
} from './utils/firebase';
import { SlidersHorizontal, CheckCircle2, ShieldCheck, Sparkles, Plus, AlertCircle, BellRing, Zap, UserPlus, Award, Home, Store, ShoppingCart, Flame } from 'lucide-react';

export default function App() {
  const { isDark, toggleTheme } = useDarkMode();
  const [listings, setListings] = useState<Listing[]>(() => getStoredListings());
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedListingIds());
  const [priceAlerts, setPriceAlerts] = useState<string[]>(() => getPriceAlertIds());

  // "I WANT THIS" Buyer requests state
  const [wantedItems, setWantedItems] = useState<WantedItem[]>(() => getLocalWantedItems());
  const [isIWantThisOpen, setIsIWantThisOpen] = useState(false);

  // Real-time Firestore sync & verification
  useEffect(() => {
    testConnection().then((connected) => {
      if (connected) {
        console.log('Firebase Firestore connection verified.');
      }
    });

    const unsubscribe = subscribeToListingsFromFirestore((remoteListings) => {
      if (remoteListings && remoteListings.length > 0) {
        setListings((prev) => {
          const remoteMap = new Map(remoteListings.map((l) => [l.id, l]));
          const merged = [...remoteListings];
          prev.forEach((localItem) => {
            if (!remoteMap.has(localItem.id)) {
              merged.push(localItem);
            }
          });
          return merged;
        });
      }
    });

    // Real-time listener for buyer requests
    const unsubscribeWanted = subscribeToWantedItemsFromFirestore((items) => {
      if (items && items.length > 0) {
        setWantedItems(items);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeWanted();
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
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'my-ads' | 'orders' | 'reputation' | 'security'>('profile');
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isVercelGuideOpen, setIsVercelGuideOpen] = useState(false);

  const handleOpenProfile = (tab: 'profile' | 'my-ads' | 'orders' | 'reputation' | 'security' = 'profile') => {
    setProfileInitialTab(tab);
    setIsProfileOpen(true);
  };

  // Products, Cart, Vendors & Orders State (Fire Safety Store)
  const [products, setProducts] = useState<Product[]>(() => SEED_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isBecomeVendorOpen, setIsBecomeVendorOpen] = useState(false);
  const [isVendorDashboardOpen, setIsVendorDashboardOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);

  const isVendor = currentUser?.userRole === 'vendor' || currentUser?.role === 'vendor' || Boolean(currentVendor);

  // Sync fire safety products from Firestore
  useEffect(() => {
    fetchProductsFromFirestore().then((items) => {
      if (items && items.length > 0) {
        setProducts(items);
      }
    });

    const unsubscribe = subscribeToProductsFromFirestore((realtimeProducts) => {
      if (realtimeProducts && realtimeProducts.length > 0) {
        setProducts(realtimeProducts);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

  // Routing state for /vendor or marketplace /
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (path === '/vendor' || path === '/vendor/' || hash === '#vendor' || params.get('page') === 'vendor') {
        return '/vendor';
      }
    }
    return '/';
  });

  const navigateToVendor = () => {
    setCurrentPath('/vendor');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/vendor');
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

  // Support direct deep links to /vendor, Cart or Checkout (#cart, #checkout, ?view=cart, ?view=checkout)
  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        if (path === '/vendor' || path === '/vendor/' || hash === '#vendor' || params.get('page') === 'vendor') {
          setCurrentPath('/vendor');
        } else {
          setCurrentPath('/');
        }

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
          item.seller.name.toLowerCase().trim() === updatedUser.name.toLowerCase().trim()
        ) {
          return {
            ...item,
            seller: {
              ...item.seller,
              isVerified: true,
              isSubscribedVerified: true,
              ghanaCardVerified: true,
              verifiedPlan: 'Verified Pro (100 GHS/mo)',
            },
          };
        }
        return item;
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
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
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

        // Location filter: supports Accra, Kumasi, Tema, Takoradi, Tamale, Cape Coast & all 16 Ghana regions
        if (filters.region && filters.region !== 'all' && filters.region !== 'All Regions' && filters.region !== 'All Ghana') {
          const selectedLoc = filters.region.trim().toLowerCase();
          const itemRegion = item.region.toLowerCase();
          const itemLocation = item.location.toLowerCase();

          // Direct city check
          const directCityMatch = itemLocation.includes(selectedLoc) || itemRegion.includes(selectedLoc);

          // 1. Direct region name match
          const mainRegionKey = filters.region.split('(')[0].trim().toLowerCase();
          const matchRegion = itemRegion.includes(mainRegionKey) || mainRegionKey.includes(itemRegion.split('(')[0].trim());
          const matchLocation = itemLocation.includes(mainRegionKey);

          // 2. Parenthesized principal towns/cities
          const bracketContent = filters.region.includes('(')
            ? filters.region.replace(/^[^(]*\(([^)]*)\).*$/, '$1').toLowerCase()
            : '';
          const matchTown = bracketContent
            ? bracketContent.split(',').some((town) => {
                const t = town.trim();
                return t.length > 2 && (itemLocation.includes(t) || itemRegion.includes(t));
              })
            : false;

          // 3. Known Ghana town & municipality synonyms
          const aliasMatch = (
            (selectedLoc.includes('accra') && ['accra', 'legon', 'madina', 'osu', 'spintex', 'cantonments', 'east legon', 'dansoman', 'circle'].some(k => itemLocation.includes(k))) ||
            (selectedLoc.includes('tema') && ['tema', 'afienya', 'dawhenya'].some(k => itemLocation.includes(k))) ||
            (selectedLoc.includes('kumasi') && ['kumasi', 'kejetia', 'bantama', 'ahodwo', 'anloga', 'knust', 'adum', 'bonwire', 'obuasi'].some(k => itemLocation.includes(k))) ||
            (selectedLoc.includes('takoradi') && ['takoradi', 'sekondi', 'tarkwa', 'harbor'].some(k => itemLocation.includes(k))) ||
            (selectedLoc.includes('tamale') && ['tamale', 'aboabo', 'savelugu', 'yendi'].some(k => itemLocation.includes(k))) ||
            (selectedLoc.includes('cape coast') && ['cape coast', 'kotokuraba', 'elmina', 'kasoa'].some(k => itemLocation.includes(k)))
          );

          if (!directCityMatch && !matchRegion && !matchLocation && !matchTown && !aliasMatch) {
            return false;
          }
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

        // Only verified (Supports Ghana Card verified or 100 GHS/mo subscribed verified)
        if (filters.onlyVerified && !item.seller.isVerified && !item.seller.isSubscribedVerified && !item.seller.ghanaCardVerified) {
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
        // Pinned promoted listings always rank first!
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;

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

  // If on /vendor page, render the full-page Vendor Dashboard + AuthModal so sellers can sign in directly
  if (currentPath === '/vendor') {
    return (
      <>
        <VendorDashboardPage
          currentUser={currentUser}
          vendor={currentVendor}
          onNavigateHome={navigateToHome}
          onOpenAuth={handleOpenAuth}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
          defaultRole={authDefaultRole}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 pb-20 md:pb-0">
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
        onOpenVerifiedSubscription={() => setIsVerifiedModalOpen(true)}
        onLogout={handleLogout}
        cartCount={getCartItemCount(cart)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMyOrders={() => {
          if (!currentUser || !auth.currentUser) {
            handleOpenAuth('signin', 'buyer');
            showToast('Sign in to view your orders.');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-semibold">
              <ShieldCheck size={16} className="text-emerald-500" />
              100% Direct Seller & Recruiter Contacts
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Zero Broker Commissions</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleOpenCourierHub}
              className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              <span>🚚 Door Courier Across Ghana (16 Regions)</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
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
      <BuyersWantFeed
        wantedItems={wantedItems}
        onOpenIWantThis={() => setIsIWantThisOpen(true)}
      />

      {/* Featured Food Vendors in Accra (shown on All & Food tabs) */}
      {(filters.category === 'all' || filters.category === 'food') && (
        <FoodVendorsSection
          onAddToCart={handleAddFoodToCart}
          cartItemCount={getCartItemCount(cart)}
          getItemQuantityInCart={getItemQuantityInCart}
          searchQuery={filters.searchQuery}
        />
      )}

      {/* General Marketplace Store Products Organized by Category (Food, Phones, Laptops, Cars, Accessories, Fashion, Home Items, Electronics) */}
      <StoreProductsSection
        products={products}
        selectedCategory={filters.category}
        searchQuery={filters.searchQuery}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Content Area: Sidebar Filters + Listings Grid */}
      <main id="browse-listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full scroll-mt-20">
        {/* Mobile Filter Toggle & Quick Recent Badge */}
        <div className="lg:hidden mb-4 flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {filteredListings.length} results
            </span>
            {recentlyViewed.length > 0 && (
              <a
                href="#recently-viewed"
                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50 flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span>🕒 Recent ({recentlyViewed.length})</span>
              </a>
            )}
          </div>
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <SlidersHorizontal size={14} />
            <span>{showMobileFilter ? 'Hide Filters' : 'Filter & Sort'}</span>
          </button>
        </div>

        {/* Mobile Filter Drawer / Collapsible Box */}
        {showMobileFilter && (
          <div className="lg:hidden mb-6 space-y-4">
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Left Sidebar: Filters & Session Recently Viewed Widget */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-20 space-y-6">
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
          </aside>

          {/* Right 3 Columns: Active Feed */}
          <section className="lg:col-span-3 space-y-6">
            {/* Sector Heading & Result Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
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
                  {[
                    { label: 'All Ghana', value: 'all' },
                    { label: 'Accra', value: 'Accra' },
                    { label: 'Kumasi', value: 'Kumasi' },
                    { label: 'Tema', value: 'Tema' },
                    { label: 'Takoradi', value: 'Takoradi' },
                    { label: 'Tamale', value: 'Tamale' },
                    { label: 'Cape Coast', value: 'Cape Coast' },
                  ].map((loc) => {
                    const isSelected =
                      filters.region === loc.value ||
                      (loc.value === 'all' && (filters.region === 'all' || filters.region === 'All Regions' || filters.region === 'All Ghana'));
                    return (
                      <button
                        key={loc.label}
                        type="button"
                        onClick={() => handleFilterUpdate({ region: loc.value })}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF6600] text-white shadow-xs font-black'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {loc.label}
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

            {/* Grid of Listings */}
            {filteredListings.length === 0 ? (
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
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {filteredListings.map((item) => (
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
                    onReportListing={(item) => setFraudReportingListing(item)}
                    onAddToCart={handleAddToCartFromListing}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Recently Viewed Section Below Main Feed */}
        <RecentlyViewed
          items={recentlyViewed}
          onOpenDetails={handleOpenListing}
          onToggleSave={handleToggleSave}
          savedIds={savedIds}
          onClear={handleClearRecentlyViewed}
          variant="feed"
        />
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenSafety={() => setIsSafetyOpen(true)}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenCourierHub={handleOpenCourierHub}
        onOpenVerifiedSubscription={() => setIsVerifiedModalOpen(true)}
        onOpenVercelDeployGuide={() => setIsVercelGuideOpen(true)}
      />

      {/* Listing Detail Modal / PDP */}
      <ListingDetailModal
        listing={selectedListing}
        isOpen={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        isSaved={selectedListing ? savedIds.includes(selectedListing.id) : false}
        onToggleSave={handleToggleSave}
        onOpenChat={(listing) => {
          setSelectedListing(null);
          setChatListing(listing);
        }}
        hasPriceAlert={selectedListing ? priceAlerts.includes(selectedListing.id) : false}
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
      />

      {/* Boost Ad Modal */}
      <BoostAdModal
        listing={boostListing}
        isOpen={Boolean(boostListing)}
        onClose={() => setBoostListing(null)}
        onBoostSuccess={handleBoostSuccess}
      />

      {/* Seller Profile Modal */}
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
      />

      {/* In-App Live Messenger Modal */}
      <ChatModal
        listing={chatListing}
        isOpen={Boolean(chatListing)}
        onClose={() => setChatListing(null)}
      />

      {/* Post Ad Wizard Modal */}
      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        onAdCreated={handleAdCreated}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
      />

      {/* Saved Ads / Bookmarks Drawer */}
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

      {/* Safe Trade Advisory Modal */}
      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />

      {/* Member Registration & Sign In Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        defaultRole={authDefaultRole}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Account & Profile Modal */}
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
      />

      {/* AF Seller Dashboard Modal (My Products, Views, Chats, Ghana Card Verification) */}
      {currentUser && (
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
        />
      )}

      {/* Buyer Fraud & Scam Report Modal */}
      {fraudReportingListing && (
        <ReportListingModal
          isOpen={Boolean(fraudReportingListing)}
          onClose={() => setFraudReportingListing(null)}
          listing={fraudReportingListing}
          onReportSuccess={(report) => {
            showToast(`🚨 Fraud report #${report.referenceId} submitted. Trust & Safety team is investigating.`);
            setFraudReportingListing(null);
          }}
        />
      )}

      {/* OGYA Ghana Door-to-Door Courier Hub Modal */}
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

      {/* Door-to-Door Courier Booking Modal with Strict Security Warning Gate */}
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

      {/* Live Parcel Transit Tracking & Release OTP Modal */}
      <CourierTrackingModal
        order={trackedCourierOrder}
        isOpen={Boolean(trackedCourierOrder)}
        onClose={() => setTrackedCourierOrder(null)}
        onOrderUpdated={(updated) => {
          setTrackedCourierOrder(updated);
          showToast(`Tracking status updated: ${updated.status.replace(/_/g, ' ')}`);
        }}
      />

      {/* Verified Pro Seller Subscription Modal (100 GHS/month Paystack MoMo/Card) */}
      <VerifiedSubscriptionModal
        isOpen={isVerifiedModalOpen}
        onClose={() => setIsVerifiedModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('signin')}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />

      {/* Vercel Automated CI/CD Deployment Guide Modal */}
      <VercelDeployGuideModal
        isOpen={isVercelGuideOpen}
        onClose={() => setIsVercelGuideOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Fire Safety Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleOpenCheckout}
      />

      {/* Checkout Modal (MTN MoMo, Telecel Cash, COD) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
        onRequireAuth={() => handleOpenAuth('signin')}
      />

      {/* My Orders Modal (Customer Orders from Firestore) */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        currentUser={currentUser}
        onOpenStore={handleScrollToMarketplace}
      />

      {/* Become a Vendor Modal (Firestore 'vendors' + role='vendor') */}
      <BecomeVendorModal
        isOpen={isBecomeVendorOpen}
        onClose={() => setIsBecomeVendorOpen(false)}
        currentUser={currentUser}
        onVendorCreated={handleVendorCreated}
        onOpenAuth={() => handleOpenAuth('signin')}
      />

      {/* Vendor Dashboard Modal (Add/Edit/Delete Own Products) */}
      <VendorDashboardModal
        isOpen={isVendorDashboardOpen}
        onClose={() => setIsVendorDashboardOpen(false)}
        currentUser={currentUser}
        vendor={currentVendor}
        products={products}
        onProductUpdated={() => fetchProductsFromFirestore().then(setProducts)}
        onOpenAuth={() => handleOpenAuth('signin', 'seller')}
      />

      {/* "I WANT THIS" Buyer Request Modal (No login required, saves to Firestore 'wanted_items') */}
      <IWantThisModal
        isOpen={isIWantThisOpen}
        onClose={() => setIsIWantThisOpen(false)}
        onItemPosted={(item) => {
          setWantedItems((prev) => [item, ...prev.filter((w) => w.id !== item.id)]);
          showToast(`🔥 Request for "${item.item}" posted live to Ghana sellers!`);
        }}
      />

      {/* Fixed Mobile Bottom Navigation Bar (Mobile-first Thumb Ergonomics) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-2xl">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          {/* Tab 1: Home / Marketplace */}
          <button
            type="button"
            onClick={() => {
              handleResetFilters();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-600 dark:text-slate-400 hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Home size={20} />
            <span className="text-[10px] font-bold mt-1">Market</span>
          </button>

          {/* Tab 2: Food Vendors */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('accra-food-vendors');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-600 dark:text-slate-400 hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <span className="text-lg">🍲</span>
            <span className="text-[10px] font-bold mt-0.5">Food</span>
          </button>

          {/* Tab 3: Center Elevated Sell Action */}
          <div className="flex items-center justify-center -mt-5">
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  handleOpenAuth('register', 'seller');
                } else {
                  setIsPostAdOpen(true);
                }
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00875A] to-[#FF6600] text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer border-2 border-white dark:border-slate-900"
              title="Sell Product on OGYA 🔥"
              aria-label="Sell Product"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>

          {/* Tab 4: Vendor Portal (/vendor) */}
          <button
            type="button"
            onClick={navigateToVendor}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-600 dark:text-slate-400 hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Store size={20} />
            <span className="text-[10px] font-bold mt-1">Vendors</span>
          </button>

          {/* Tab 5: Cart */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-slate-600 dark:text-slate-400 hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ShoppingCart size={20} />
            <span className="text-[10px] font-bold mt-1">Cart</span>
            {cart.length > 0 && (
              <span className="absolute top-1.5 right-2 min-w-4 h-4 px-1 rounded-full bg-[#FF6600] text-white text-[9px] font-black flex items-center justify-center">
                {cart.reduce((sum, it) => sum + it.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
