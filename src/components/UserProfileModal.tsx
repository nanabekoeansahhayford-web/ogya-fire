import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Building2,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Calendar,
  LogOut,
  Edit3,
  CheckCircle2,
  Plus,
  Zap,
  Sparkles,
  ExternalLink,
  Save,
  Award,
  Check,
  HelpCircle,
  RotateCcw,
  ShoppingBag,
  Package,
  Truck,
  Clock,
  AlertCircle,
  Banknote,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Search,
  ShoppingCart,
  UtensilsCrossed,
  Flame,
  RefreshCw,
  Bike,
} from 'lucide-react';
import { UserProfile, Listing, SellerInfo } from '../types/marketplace';
import { updateUserProfile } from '../utils/auth';
import { formatPrice, markListingAsSold } from '../utils/storage';
import { updateListingStatusInFirestore, fetchOrdersByUserId, subscribeToOrdersByUserId } from '../utils/firebase';
import { REGIONS } from '../data/categories';
import { getSellerReputation, BADGE_DEFINITIONS } from '../utils/reputation';
import { ReputationBadge } from './ReputationBadge';
import { Order, CartItem, OrderStatus } from '../types/store';
import { getLocalPlacedOrders, addToCart } from '../utils/cartStorage';
import mamaEfuaImg from '../assets/images/food_mama_efua_jollof_1793886043512.jpg';
import accraGrillImg from '../assets/images/food_accra_grill_tilapia_1793886043887.jpg';
import auntieMuniImg from '../assets/images/food_auntie_muni_waakye_1793886045717.jpg';
import freshJuiceImg from '../assets/images/food_fresh_juice_bar_1793886046929.jpg';

// Pre-seeded demo orders representing authentic Ghanaian food and safety equipment
const DEMO_PAST_ORDERS: Order[] = [
  {
    id: 'ord-gh-9841',
    userId: 'demo-user',
    buyerName: 'Customer',
    vendorId: 'vendor-mama-efua',
    items: [
      {
        id: 'efua-1',
        name: 'Jollof Rice + Grilled Chicken',
        price: 45,
        category: 'Ghanaian Food',
        imageUrl: mamaEfuaImg,
        quantity: 2,
        stock: 50,
        vendorId: 'vendor-mama-efua',
        vendorName: "Mama Efua's Kitchen (Osu)",
      },
      {
        id: 'efua-2',
        name: 'Waakye + Egg',
        price: 35,
        category: 'Ghanaian Food',
        imageUrl: auntieMuniImg,
        quantity: 1,
        stock: 50,
        vendorId: 'vendor-mama-efua',
        vendorName: "Mama Efua's Kitchen (Osu)",
      },
    ],
    total: 135,
    deliveryAddress: 'House 14, Oxford Street, Osu, Accra',
    phone: '+233 24 555 0192',
    status: 'delivered',
    paymentMethod: 'MTN MoMo',
    momoNumber: '0245550192',
    createdAt: '2026-11-04T13:20:00Z',
  },
  {
    id: 'ord-gh-9842',
    userId: 'demo-user',
    buyerName: 'Customer',
    vendorId: 'vendor-accra-grill',
    items: [
      {
        id: 'grill-1',
        name: 'Grilled Tilapia + Banku',
        price: 60,
        category: 'Ghanaian Food',
        imageUrl: accraGrillImg,
        quantity: 1,
        stock: 30,
        vendorId: 'vendor-accra-grill',
        vendorName: 'Accra Grill House (East Legon)',
      },
      {
        id: 'grill-3',
        name: 'Beef Shawarma',
        price: 38,
        category: 'Ghanaian Food',
        imageUrl: accraGrillImg,
        quantity: 1,
        stock: 40,
        vendorId: 'vendor-accra-grill',
        vendorName: 'Accra Grill House (East Legon)',
      },
    ],
    total: 108,
    deliveryAddress: 'Lagos Avenue, Near A&C Mall, East Legon, Accra',
    phone: '+233 20 123 9876',
    status: 'pending',
    paymentMethod: 'Cash on Delivery',
    createdAt: '2026-11-06T11:45:00Z',
  },
  {
    id: 'ord-gh-9843',
    userId: 'demo-user',
    buyerName: 'Customer',
    vendorId: 'vnd-ogya-central',
    items: [
      {
        id: 'prod-fe-6kg-abc',
        name: '6KG ABC Dry Powder Fire Extinguisher (ISO & GNFS Approved)',
        price: 450,
        category: 'Fire Extinguisher',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
        quantity: 1,
        stock: 24,
        vendorId: 'vnd-ogya-central',
        vendorName: 'OGYA Fire Direct Ltd (Accra)',
      },
    ],
    total: 450,
    deliveryAddress: 'Plot 18, Ring Road Central, Kokomlemle, Accra',
    phone: '+233 24 412 3456',
    status: 'delivered',
    paymentMethod: 'MTN MoMo',
    momoNumber: '0244123456',
    createdAt: '2026-10-30T09:15:00Z',
  },
  {
    id: 'ord-gh-9844',
    userId: 'demo-user',
    buyerName: 'Customer',
    vendorId: 'vendor-fresh-juice',
    items: [
      {
        id: 'juice-1',
        name: 'Mango Smoothie',
        price: 25,
        category: 'Drinks & Smoothies',
        imageUrl: freshJuiceImg,
        quantity: 2,
        stock: 50,
        vendorId: 'vendor-fresh-juice',
        vendorName: 'Fresh Juice & Smoothie Bar (Cantonments)',
      },
      {
        id: 'juice-2',
        name: 'Pineapple Ginger Juice',
        price: 18,
        category: 'Drinks & Smoothies',
        imageUrl: freshJuiceImg,
        quantity: 1,
        stock: 50,
        vendorId: 'vendor-fresh-juice',
        vendorName: 'Fresh Juice & Smoothie Bar (Cantonments)',
      },
    ],
    total: 78,
    deliveryAddress: 'House 8, Cantonments Road, Cantonments, Accra',
    phone: '+233 27 777 8899',
    status: 'shipped',
    paymentMethod: 'Telecel Cash',
    momoNumber: '0277778899',
    createdAt: '2026-11-05T15:30:00Z',
  },
];

interface UserProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenPostAd: () => void;
  allListings: Listing[];
  onOpenListing: (listing: Listing) => void;
  onOpenBoost?: (listing: Listing) => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onListingUpdated?: (updated: Listing) => void;
  initialTab?: 'profile' | 'my-ads' | 'orders' | 'reputation' | 'security';
  onOpenStore?: () => void;
  onOpenFoodVendors?: () => void;
  onOpenCart?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onOpenPostAd,
  allListings,
  onOpenListing,
  onOpenBoost,
  onProfileUpdated,
  onListingUpdated,
  initialTab = 'profile',
  onOpenStore,
  onOpenFoodVendors,
  onOpenCart,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'my-ads' | 'orders' | 'reputation' | 'security'>(
    initialTab || 'profile'
  );
  const [isEditing, setIsEditing] = useState(false);

  // Sync activeTab when initialTab or isOpen changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Edit states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [city, setCity] = useState(user?.city || '');
  const [region, setRegion] = useState(user?.region || REGIONS[0]);
  const [bio, setBio] = useState(user?.bio || '');
  const [toast, setToast] = useState<string | null>(null);
  const [updatingListingId, setUpdatingListingId] = useState<string | null>(null);
  const [adsFilter, setAdsFilter] = useState<'all' | 'active' | 'sold'>('all');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<'all' | 'food' | 'products' | 'pending' | 'delivered'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Fetch and listen to user orders
  useEffect(() => {
    if (!isOpen) return;

    setIsOrdersLoading(true);
    const localOrders: Order[] = getLocalPlacedOrders();

    if (user?.id) {
      // 1. Fetch from Firestore
      fetchOrdersByUserId(user.id)
        .then((remoteOrders) => {
          const orderMap = new Map<string, Order>();
          remoteOrders.forEach((o) => orderMap.set(o.id, o));
          localOrders.forEach((o) => {
            if (!orderMap.has(o.id)) orderMap.set(o.id, o);
          });

          // If user has placed no live orders yet, include demo orders so history is immediately rich
          if (orderMap.size === 0) {
            DEMO_PAST_ORDERS.forEach((o) => orderMap.set(o.id, o));
          }

          setOrders(Array.from(orderMap.values()));
          setIsOrdersLoading(false);
        })
        .catch(() => {
          const orderMap = new Map<string, Order>();
          localOrders.forEach((o) => orderMap.set(o.id, o));
          if (orderMap.size === 0) {
            DEMO_PAST_ORDERS.forEach((o) => orderMap.set(o.id, o));
          }
          setOrders(Array.from(orderMap.values()));
          setIsOrdersLoading(false);
        });

      // 2. Real-time Firestore subscription
      const unsubscribe = subscribeToOrdersByUserId(user.id, (remoteOrders) => {
        const orderMap = new Map<string, Order>();
        remoteOrders.forEach((o) => orderMap.set(o.id, o));
        localOrders.forEach((o) => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });
        if (orderMap.size === 0) {
          DEMO_PAST_ORDERS.forEach((o) => orderMap.set(o.id, o));
        }
        setOrders(Array.from(orderMap.values()));
        setIsOrdersLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } else {
      const orderMap = new Map<string, Order>();
      localOrders.forEach((o) => orderMap.set(o.id, o));
      if (orderMap.size === 0) {
        DEMO_PAST_ORDERS.forEach((o) => orderMap.set(o.id, o));
      }
      setOrders(Array.from(orderMap.values()));
      setIsOrdersLoading(false);
    }
  }, [isOpen, user?.id]);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(
        {
          id: item.id,
          name: item.name,
          description: item.name,
          price: item.price,
          category: item.category,
          imageUrl: item.imageUrl,
          stock: item.stock || 50,
          vendorId: item.vendorId || order.vendorId || 'vnd-ogya',
          vendorName: item.vendorName || order.buyerName || 'OGYA Merchant',
        },
        item.quantity || 1
      );
    });
    setToast(`🛒 Re-added ${order.items.length} item${order.items.length > 1 ? 's' : ''} to your Cart!`);
    setTimeout(() => setToast(null), 3500);
  };

  if (!isOpen || !user) return null;

  // Filter listings by current user
  const userListings = allListings.filter(
    (l) => l.userId === user.id || l.seller.name.toLowerCase() === user.name.toLowerCase()
  );

  const activeUserListings = userListings.filter((l) => l.status !== 'sold' && !l.isSold);
  const soldUserListings = userListings.filter((l) => l.status === 'sold' || l.isSold);

  const displayedUserListings = userListings.filter((l) => {
    const isItemSold = l.status === 'sold' || Boolean(l.isSold);
    if (adsFilter === 'active') return !isItemSold;
    if (adsFilter === 'sold') return isItemSold;
    return true;
  });

  const handleToggleSold = async (item: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentlySold = item.status === 'sold' || Boolean(item.isSold);
    const nextSoldState = !currentlySold;
    const nextStatus: 'active' | 'sold' = nextSoldState ? 'sold' : 'active';
    setUpdatingListingId(item.id);

    try {
      // 1. Update in Firestore
      await updateListingStatusInFirestore(item.id, nextStatus, nextSoldState);

      // 2. Update in localStorage
      markListingAsSold(item.id, nextSoldState);

      // 3. Create updated listing object
      const updated: Listing = {
        ...item,
        status: nextStatus,
        isSold: nextSoldState,
        soldAt: nextSoldState ? new Date().toISOString() : undefined,
      };

      if (onListingUpdated) {
        onListingUpdated(updated);
      }

      setToast(
        nextSoldState
          ? `🎉 Listing "${item.title.slice(0, 24)}..." marked as SOLD!`
          : `Listing "${item.title.slice(0, 24)}..." restored to Active!`
      );
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('Error toggling sold status:', err);
      markListingAsSold(item.id, nextSoldState);
      const updated: Listing = {
        ...item,
        status: nextStatus,
        isSold: nextSoldState,
      };
      if (onListingUpdated) {
        onListingUpdated(updated);
      }
      setToast(nextSoldState ? 'Listing marked as SOLD.' : 'Listing restored to Active.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUpdatingListingId(null);
    }
  };

  const userSellerInfo: SellerInfo = {
    name: user.businessName || user.name,
    isVerified: user.isVerified,
    memberSince: user.memberSince,
    phone: user.phone,
    whatsapp: user.whatsapp || user.phone,
    rating: 5.0,
    reviewCount: Math.max(userListings.length * 4, 3),
    responseTime: 'Under 10 mins',
    location: user.city || user.region,
  };
  const reputation = getSellerReputation(userSellerInfo, userListings.length);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateUserProfile(user.id, {
      name,
      phone,
      whatsapp,
      city,
      region,
      bio,
    });
    if (updated) {
      onProfileUpdated(updated);
      setIsEditing(false);
      setToast('Profile updated successfully!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleRequestVerification = () => {
    const updated = updateUserProfile(user.id, { isVerified: true });
    if (updated) {
      onProfileUpdated(updated);
      setToast('🎉 Congratulations! Your OGYA Verified Seller badge has been activated.');
      setTimeout(() => setToast(null), 3500);
    }
  };

  const formatOrderDate = (dateVal: any): string => {
    if (!dateVal) return 'Recently';
    try {
      if (typeof dateVal === 'object' && dateVal.seconds) {
        const d = new Date(dateVal.seconds * 1000);
        return d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {
      // fallback
    }
    return String(dateVal);
  };

  const isFoodOrder = (order: Order): boolean => {
    return order.items.some((item) => {
      const cat = String(item.category || '').toLowerCase();
      const name = String(item.name || '').toLowerCase();
      return (
        cat.includes('food') ||
        cat.includes('rice') ||
        cat.includes('grill') ||
        cat.includes('drink') ||
        cat.includes('smoothie') ||
        cat.includes('delicac') ||
        cat.includes('pizza') ||
        name.includes('jollof') ||
        name.includes('waakye') ||
        name.includes('tilapia') ||
        name.includes('banku') ||
        name.includes('pizza') ||
        name.includes('kelewele') ||
        name.includes('smoothie') ||
        name.includes('juice') ||
        name.includes('shawarma') ||
        name.includes('koko') ||
        name.includes('koose') ||
        name.includes('chichinga')
      );
    });
  };

  const renderOrderStatusBadge = (status: OrderStatus | string) => {
    const norm = String(status).toLowerCase();

    if (norm === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          <span>Delivered</span>
        </span>
      );
    }

    if (norm === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800 shadow-2xs">
          <Truck size={12} className="text-blue-600 dark:text-blue-400" />
          <span>In Transit</span>
        </span>
      );
    }

    if (norm === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
          <span>Paid</span>
        </span>
      );
    }

    if (norm === 'pending_payment') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs">
          <Clock size={12} className="text-amber-600 animate-spin" />
          <span>Pending Payment</span>
        </span>
      );
    }

    if (norm === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs">
          <Clock size={12} className="text-amber-600" />
          <span>Pending Delivery</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs">
        <Clock size={12} />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Category filter
      const isFood = isFoodOrder(o);
      if (ordersFilter === 'food' && !isFood) return false;
      if (ordersFilter === 'products' && isFood) return false;
      if (ordersFilter === 'pending' && o.status !== 'pending' && o.status !== 'pending_payment') return false;
      if (ordersFilter === 'delivered' && o.status !== 'delivered' && o.status !== 'paid') return false;

      // Search query
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchVendor = (o.buyerName || '').toLowerCase().includes(q) || (o.vendorId || '').toLowerCase().includes(q);
        const matchAddress = o.deliveryAddress.toLowerCase().includes(q);
        const matchItems = o.items.some(
          (it) => it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q)
        );
        return matchId || matchVendor || matchAddress || matchItems;
      }

      return true;
    });
  }, [orders, ordersFilter, orderSearchQuery]);

  const foodOrdersCount = orders.filter(isFoodOrder).length;
  const productOrdersCount = orders.filter((o) => !isFoodOrder(o)).length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered' || o.status === 'paid').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'pending_payment').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 p-6 text-white">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 bg-black/35 hover:bg-rose-600 text-white rounded-xl transition-all font-black text-xs flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-sm"
              title={`Log Out from ${user.name}`}
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-white/20 p-1 border-2 border-white/40 overflow-hidden shadow-lg shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 font-black text-2xl text-amber-400">
                  {user.name.charAt(0)}
                </div>
              )}
              {user.isVerified && (
                <span className="absolute bottom-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white" title="Verified Member">
                  <ShieldCheck size={14} />
                </span>
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">{user.name}</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                  user.accountType === 'buyer'
                    ? 'bg-sky-500 text-white'
                    : 'bg-amber-400 text-slate-950 font-black'
                }`}>
                  <span>{user.accountType === 'buyer' ? '🛒 Buyer Account' : '🔥 Seller Account'}</span>
                </span>
                {user.isVerified ? (
                  <span className="bg-emerald-500/90 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck size={11} />
                    Verified
                  </span>
                ) : (
                  <button
                    onClick={handleRequestVerification}
                    className="bg-white/25 hover:bg-white/35 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                    title="Click to activate your verified badge"
                  >
                    <Sparkles size={11} />
                    Get Verified Badge
                  </button>
                )}
              </div>

              <p className="text-xs text-white/90 capitalize mt-0.5 font-medium">
                {user.accountType === 'business'
                  ? user.businessCategory || 'Merchant Store'
                  : user.accountType === 'jobseeker'
                  ? user.profession || 'Job Candidate'
                  : 'Individual Member'}
                {' • '}
                <span>Member since {user.memberSince}</span>
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-white/90 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-amber-200" />
                  {user.city || user.region.split('(')[0].trim()}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-amber-200" />
                  {user.phone}
                </span>
              </div>

              {/* Reputation badges showcase in banner */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap mt-2.5">
                {reputation.badges.map((b) => (
                  <ReputationBadge
                    key={b.badgeId}
                    badge={b}
                    size="xs"
                    interactive={true}
                    showTooltip={false}
                    onClick={() => setActiveTab('reputation')}
                    className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setActiveTab('reputation')}
                  className="text-[10px] font-extrabold text-amber-200 bg-black/25 px-2 py-0.5 rounded-full hover:bg-black/40 transition-colors cursor-pointer"
                >
                  {reputation.score}% Trust Score
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/20 pb-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-white text-white font-extrabold'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              My Account Details
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-white text-white font-extrabold'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <ShoppingBag size={13} />
              <span>My Order History</span>
              {orders.length > 0 && (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-black">
                  {orders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('my-ads')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'my-ads'
                  ? 'border-white text-white font-extrabold'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <span>My Ads</span>
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                {userListings.length}
              </span>
              {soldUserListings.length > 0 && (
                <span className="bg-red-500/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  {soldUserListings.length} Sold
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reputation')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reputation'
                  ? 'border-white text-white font-extrabold'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Award size={13} />
              <span>Seller Reputation & Badges</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
                {reputation.badges.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-white text-white font-extrabold'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              Security & Sign Out
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {toast && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* Tab 1: Profile Details & Edit */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isEditing ? 'Editing Your Details' : 'Account Information'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name / Business Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Region
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Town / Area
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bio / About You or Your Store
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Save size={14} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Email</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{user.email}</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone Number</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{user.phone}</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">WhatsApp</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{user.whatsapp || user.phone}</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Location</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{user.city || user.region}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">About / Bio</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{user.bio}</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPostAd();
                      }}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Post a New Ad with Your Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: My Order History (Past Food & Product Orders) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Header with Search and Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag size={16} className="text-[#00875A]" />
                    <span>My Order History</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Track past Ghanaian food deliveries and verified equipment orders
                  </p>
                </div>

                {/* Sub-filter chips */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      ordersFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('food')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      ordersFilter === 'food'
                        ? 'bg-white dark:bg-slate-900 text-[#00875A] dark:text-emerald-400 shadow-2xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🍲 Food</span>
                    <span className="text-[10px] opacity-75">({foodOrdersCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('products')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      ordersFilter === 'products'
                        ? 'bg-white dark:bg-slate-900 text-[#FF6600] shadow-2xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>📦 Products</span>
                    <span className="text-[10px] opacity-75">({productOrdersCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('delivered')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      ordersFilter === 'delivered'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Delivered ({deliveredOrdersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('pending')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      ordersFilter === 'pending'
                        ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Pending ({pendingOrdersCount})
                  </button>
                </div>
              </div>

              {/* Order Search bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders by item, dish, or vendor name..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00875A]"
                />
                {orderSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Orders List Container */}
              {isOrdersLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading your order history...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      No matching orders found
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                      {orderSearchQuery
                        ? `No orders matching "${orderSearchQuery}". Try clearing your search.`
                        : 'Explore popular Ghanaian kitchens or fire safety equipment and enjoy fast doorstep delivery.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    {onOpenFoodVendors && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenFoodVendors();
                        }}
                        className="px-3.5 py-2 bg-[#00875A] hover:bg-[#00704a] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <UtensilsCrossed size={13} />
                        <span>Browse Accra Food Vendors 🍲</span>
                      </button>
                    )}
                    {onOpenStore && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenStore();
                        }}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                      >
                        <Flame size={13} className="text-[#FF6600]" />
                        <span>Safety Equipment Store</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const isFood = isFoodOrder(order);
                    const isExpanded = expandedOrderId === order.id;
                    const totalItemsCount = order.items.reduce((s, it) => s + (it.quantity || 1), 0);

                    return (
                      <div
                        key={order.id}
                        className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200"
                      >
                        {/* Top Card Header */}
                        <div className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                isFood
                                  ? 'bg-[#00875A]/15 text-[#00875A] dark:text-emerald-400'
                                  : 'bg-[#FF6600]/15 text-[#FF6600]'
                              }`}
                            >
                              {isFood ? <UtensilsCrossed size={17} /> : <Package size={17} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white font-mono tracking-tight">
                                  #{order.id.slice(0, 16)}
                                </span>
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    isFood
                                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300'
                                      : 'bg-orange-100 text-orange-900 dark:bg-orange-950/70 dark:text-orange-300'
                                  }`}
                                >
                                  {isFood ? '🍲 Food Delivery' : '📦 Safety Gear'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock size={11} />
                                  <span>{formatOrderDate(order.createdAt)}</span>
                                </span>
                                <span>•</span>
                                <span>{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {renderOrderStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Items Purchased List */}
                        <div className="p-3.5 sm:p-4 space-y-3">
                          <div className="space-y-2.5">
                            {order.items.map((item, idx) => (
                              <div
                                key={`${item.id}-${idx}`}
                                className="flex items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 overflow-hidden shrink-0 border border-slate-200/70 dark:border-slate-700">
                                    {item.imageUrl ? (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        {isFood ? <UtensilsCrossed size={16} /> : <Package size={16} />}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h6 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                        {item.name}
                                      </h6>
                                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.2 rounded">
                                        {item.quantity}x
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                      <span className="text-[#00875A] dark:text-emerald-400 font-bold">
                                        {item.category}
                                      </span>
                                      {item.vendorName && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate">{item.vendorName}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums block">
                                    ₵ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">
                                    ₵{item.price?.toFixed(2)} each
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Expanded Full Order Details: Address, Contact, Payment */}
                          {isExpanded && (
                            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40 -mx-3.5 sm:-mx-4 px-3.5 sm:px-4 py-3 space-y-2 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Delivery Address
                                  </span>
                                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                                    <MapPin size={12} className="text-amber-500 shrink-0" />
                                    <span>{order.deliveryAddress || 'Standard Accra Delivery'}</span>
                                  </span>
                                </div>

                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Recipient Contact
                                  </span>
                                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                                    <Phone size={12} className="text-emerald-500 shrink-0" />
                                    <span>{order.phone || user.phone}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/40 text-slate-600 dark:text-slate-300">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Payment Method
                                  </span>
                                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                                    <Banknote size={12} className="text-[#00875A] shrink-0" />
                                    <span>{order.paymentMethod || 'Mobile Money'}</span>
                                    {order.momoNumber && (
                                      <span className="text-slate-400 text-[11px]">({order.momoNumber})</span>
                                    )}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Courier Delivery Fee
                                  </span>
                                  <span className="font-semibold text-[#00875A] dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                                    <Bike size={12} />
                                    <span>₵10.00 Flat Express Courier Included</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Order Footer & Total Amount & Action Buttons */}
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Total:
                              </span>
                              <span className="text-base sm:text-lg font-black text-[#00875A] dark:text-emerald-400 tabular-nums">
                                ₵ {order.total.toFixed(2)}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                ({order.total} GHS)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleReorder(order)}
                                className="px-3.5 py-1.5 text-xs font-bold bg-[#FF6600] hover:bg-[#e65c00] text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                                title="Add these items to your cart again"
                              >
                                <ShoppingCart size={13} />
                                <span>Order Again</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: My Ads */}
          {activeTab === 'my-ads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                {/* Sub-filter chips */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAdsFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      adsFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All ({userListings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdsFilter('active')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      adsFilter === 'active'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Active ({activeUserListings.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdsFilter('sold')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      adsFilter === 'sold'
                        ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Sold ({soldUserListings.length})</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPostAd();
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Post Another Ad</span>
                </button>
              </div>

              {displayedUserListings.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
                    {userListings.length === 0
                      ? "You haven't posted any ads yet."
                      : adsFilter === 'sold'
                      ? 'No items currently marked as sold.'
                      : 'No active listings in this category.'}
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPostAd();
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={15} />
                    <span>Create An Ad Free</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayedUserListings.map((item) => {
                    const isItemSold = item.status === 'sold' || Boolean(item.isSold);
                    const isProcessing = updatingListingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 bg-white dark:bg-slate-800/80 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                          isItemSold
                            ? 'border-slate-200 dark:border-slate-800 opacity-90 bg-slate-50/50 dark:bg-slate-900/50'
                            : 'border-slate-200 dark:border-slate-700/80 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden min-w-0">
                          {/* Image with SOLD banner badge */}
                          <div className="relative w-16 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={item.images[0] || '/src/assets/images/hero_marketplace_showcase_1792291775965.jpg'}
                              alt={item.title}
                              className={`w-full h-full object-cover ${isItemSold ? 'grayscale-40 contrast-90' : ''}`}
                            />
                            {isItemSold && (
                              <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                                <span className="bg-red-600 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider shadow-sm">
                                  SOLD
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="overflow-hidden min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {item.title}
                              </h5>
                              {isItemSold ? (
                                <span className="bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-[10px] font-black uppercase px-2 py-0.2 rounded-md shrink-0">
                                  SOLD
                                </span>
                              ) : (
                                <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-md shrink-0 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Active
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                              {formatPrice(item.price, item.currency)}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {item.viewsCount} views • {item.postedAt}
                              {isItemSold && item.soldAt && (
                                <span className="ml-1 text-red-500 dark:text-red-400">
                                  • Sold recently
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons including Mark as Sold */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {!isItemSold ? (
                            <button
                              type="button"
                              onClick={(e) => handleToggleSold(item, e)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                              title="Mark this ad as SOLD in Firestore and display SOLD badge"
                            >
                              {isProcessing ? (
                                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle2 size={13} className="text-slate-950 stroke-[2.5]" />
                              )}
                              <span>Mark as Sold</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleToggleSold(item, e)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50 border border-slate-200 dark:border-slate-600"
                              title="Reactivate this ad back to Active status in Firestore"
                            >
                              {isProcessing ? (
                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <RotateCcw size={12} />
                              )}
                              <span>Reactivate</span>
                            </button>
                          )}

                          {!isItemSold && onOpenBoost && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenBoost(item);
                              }}
                              className="p-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 rounded-lg transition-colors cursor-pointer"
                              title="Boost this ad"
                            >
                              <Zap size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onClose();
                              onOpenListing(item);
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>View</span>
                            <ExternalLink size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Seller Reputation & Badges */}
          {activeTab === 'reputation' && (
            <div className="space-y-5">
              {/* Reputation Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      Your Seller Standing
                    </span>
                    <h4 className="text-lg font-black text-white mt-0.5">{reputation.tierName}</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      High reputation sellers receive up to 3.4x more inquiries and priority placement.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Trust Rating</span>
                      <span className="text-2xl font-black text-emerald-400 tabular-nums">
                        {reputation.score}%
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-black text-sm">
                      ✓
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Active Badges</span>
                    <span className="font-extrabold text-white text-base">{reputation.badges.length} / 5</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Chat Speed</span>
                    <span className="font-extrabold text-white text-base">Under 10 mins</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Safe Handoff</span>
                    <span className="font-extrabold text-emerald-400 text-base">100%</span>
                  </div>
                </div>
              </div>

              {/* All Badges Status Matrix */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" />
                  <span>Reputation Badges Status</span>
                </h5>

                <div className="space-y-3">
                  {Object.values(BADGE_DEFINITIONS).map((badge) => {
                    const isEarned = reputation.badges.some((b) => b.badgeId === badge.badgeId);

                    return (
                      <div
                        key={badge.badgeId}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isEarned
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 shadow-2xs'
                            : 'bg-slate-50/50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <ReputationBadge badge={badge} size="sm" interactive={false} showTooltip={false} />
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                                {badge.description}
                              </p>
                              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <strong className="text-slate-700 dark:text-slate-300">Criteria:</strong> {badge.criteria}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isEarned ? (
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <Check size={12} /> Active
                              </span>
                            ) : badge.badgeId === 'verified-pro' ? (
                              <button
                                type="button"
                                onClick={handleRequestVerification}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Sparkles size={11} /> Verify Now
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips for boosting reputation */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200 space-y-1.5">
                <span className="font-bold flex items-center gap-1 text-amber-900 dark:text-amber-300">
                  <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
                  Tips to Level Up Your Seller Reputation
                </span>
                <ul className="list-disc list-inside space-y-1 text-amber-900/90 dark:text-amber-300/90 leading-relaxed text-[11px]">
                  <li>Respond promptly to in-app buyer chats within 15 minutes.</li>
                  <li>Provide accurate, high-resolution photos and descriptions of your goods.</li>
                  <li>Request satisfied buyers to leave verified reviews after smooth inspections.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 4: Security & Sign Out */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold mb-1">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Account Security & Verification</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your OGYA account is protected by verified phone binding. All listings and direct inquiries are monitored by our automated fraud detection system.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-rose-900 dark:text-rose-300">Sign Out of Account</h5>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400">
                    Signing out will clear this session from this browser.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
