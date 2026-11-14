import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Bookmark,
  ShieldCheck,
  BriefcaseBusiness,
  FileText,
  Sun,
  Moon,
  User,
  UserPlus,
  LogIn,
  LogOut,
  Truck,
  ShoppingCart,
  Store,
  Package,
  Menu,
  X,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types/marketplace';
import { isUserBuyer, isUserSeller } from '../utils/auth';

const POPULAR_SUGGESTIONS = [
  'Jollof Rice',
  'Waakye Special',
  'Kente Cloth',
  'iPhone',
  'Tilapia',
];

interface HeaderProps {
  onGoHome: () => void;
  onOpenPostAd: () => void;
  onOpenSaved: () => void;
  onOpenSafety: () => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenCourierHub?: () => void;
  onOpenVerifiedSubscription?: () => void;
  onOpenIWantThis?: () => void;
  savedCount: number;
  isDark?: boolean;
  onToggleTheme?: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'register' | 'signin', defaultRole?: 'buyer' | 'seller') => void;
  onOpenProfile: () => void;
  onOpenSellerDashboard?: () => void;
  onLogout?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenMyOrders?: () => void;
  onOpenBecomeVendor?: () => void;
  onOpenVendorDashboard?: () => void;
  isVendor?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onExecuteSearch?: (query?: string) => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenPostAd,
  onOpenSaved,
  onOpenSafety,
  onSelectCategory,
  onOpenCourierHub,
  onOpenVerifiedSubscription,
  onOpenIWantThis,
  savedCount,
  isDark = false,
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenSellerDashboard,
  onLogout,
  cartCount = 0,
  onOpenCart,
  onOpenMyOrders,
  onOpenBecomeVendor,
  onOpenVendorDashboard,
  isVendor = false,
  searchQuery = '',
  onSearchChange = () => {},
  onExecuteSearch,
  onOpenSettings,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isPcSearchedFocused, setIsPcSearchedFocused] = useState(false);

  const pcSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const pcInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus mobile search input immediately with blinking cursor when opened
  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = setTimeout(() => {
        if (mobileInputRef.current) {
          mobileInputRef.current.focus();
          // Position cursor at end of input
          const len = mobileInputRef.current.value.length;
          mobileInputRef.current.setSelectionRange(len, len);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  // Click outside listener for PC search suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pcSearchContainerRef.current && !pcSearchContainerRef.current.contains(e.target as Node)) {
        setIsPcSearchedFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerSearch = (queryToSearch = searchQuery) => {
    if (onSearchChange) {
      onSearchChange(queryToSearch);
    }
    if (onExecuteSearch) {
      onExecuteSearch(queryToSearch);
    } else {
      setTimeout(() => {
        const el = document.getElementById('browse-listings') || document.querySelector('main');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
    setIsMobileSearchOpen(false);
    setIsPcSearchedFocused(false);
  };

  const handleToggleMobileSearch = () => {
    setIsMobileMenuOpen(false); // Close menu if open
    setIsMobileSearchOpen((prev) => !prev);
  };
  const isBuyer = isUserBuyer(currentUser);
  const isSeller = isUserSeller(currentUser);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleNavClick = (action?: () => void) => {
    setIsMobileMenuOpen(false);
    if (action) action();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => handleNavClick(onGoHome)}
          className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-950 dark:text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer text-left"
          title="OGYA 🔥 - Shop Local in Accra - Fast Delivery"
        >
          <span className="bg-gradient-to-tr from-[#00875A] via-emerald-600 to-[#FF6600] text-white w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-base sm:text-lg shadow-sm">
            🔥
          </span>
          <span className="tracking-tight flex items-center gap-1 sm:gap-1.5">
            <span className="text-slate-950 dark:text-white">OGYA</span>
            <span className="text-[#FF6600] text-xs sm:text-sm font-black tracking-wider uppercase">
              FIRE
            </span>
            <span aria-hidden="true" className="text-base sm:text-xl">
              🔥
            </span>
          </span>
        </button>

        {/* Zone 1B: PC ALWAYS VISIBLE FULL SEARCH BAR (1025px+) */}
        <div ref={pcSearchContainerRef} className="hidden lg:flex items-center flex-1 max-w-sm xl:max-w-md mx-3 relative z-30">
          <div className="w-full relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl hover:border-amber-500 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-inner">
            <Search size={16} className="text-slate-400 dark:text-slate-500 ml-3 shrink-0" />
            <input
              ref={pcInputRef}
              type="text"
              placeholder="Search Waakye, Jollof, Phones, Kente..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsPcSearchedFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTriggerSearch(searchQuery);
                }
              }}
              className="w-full bg-transparent px-2.5 py-2 text-xs xl:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none caret-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  pcInputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors mr-1"
                title="Clear search text"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleTriggerSearch(searchQuery)}
              className="m-1 px-3 py-1.5 bg-[#00875A] hover:bg-[#00704a] active:bg-[#005a3c] text-white font-black text-xs rounded-lg flex items-center gap-1 cursor-pointer shadow-xs transition-all shrink-0 active:scale-95"
              title="Search OGYA FIRE"
            >
              <span>Search</span>
              <span className="text-[#FF6600]">🔥</span>
            </button>
          </div>

          {/* Suggestions dropdown on PC when focused */}
          {isPcSearchedFocused && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  Popular Suggestions:
                </span>
                <button
                  type="button"
                  onClick={() => setIsPcSearchedFocused(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      onSearchChange(sug);
                      handleTriggerSearch(sug);
                    }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zone 2A: Tablet Navigation Links (481px - 1024px) - Icons + Shortened labels */}
        <nav className="hidden md:flex lg:hidden items-center gap-1 xl:gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              const el = document.getElementById('accra-food-vendors');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#00875A] dark:hover:text-emerald-400 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Food Vendors"
          >
            <span>🍲</span>
            <span>Food</span>
          </button>
          <button
            onClick={onGoHome}
            className="hover:text-[#00875A] dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Market
          </button>
          {onOpenIWantThis && (
            <button
              onClick={onOpenIWantThis}
              className="text-[#FF6600] hover:text-orange-600 px-2 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors flex items-center gap-1 cursor-pointer font-extrabold"
              title="I Want This"
            >
              <span>🔥</span>
              <span>Want</span>
            </button>
          )}
          {onOpenCourierHub && (
            <button
              onClick={onOpenCourierHub}
              className="hover:text-[#00875A] dark:hover:text-emerald-400 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#00875A] dark:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Accra Delivery"
            >
              <Truck size={14} />
              <span>Delivery</span>
            </button>
          )}
          {onOpenMyOrders && (
            <button
              onClick={onOpenMyOrders}
              className="hover:text-slate-950 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="My Orders"
            >
              <Package size={14} />
              <span>Orders</span>
            </button>
          )}
          {onOpenVendorDashboard && (
            <button
              onClick={onOpenVendorDashboard}
              className="text-[#00875A] dark:text-emerald-400 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 transition-colors flex items-center gap-1 cursor-pointer"
              title="Vendor Dashboard"
            >
              <Store size={14} />
              <span>Vendors</span>
            </button>
          )}
          <button
            onClick={onOpenSaved}
            className="hover:text-slate-950 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer relative"
            title="Saved Items"
          >
            <Bookmark size={14} />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="ml-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1 py-0.2 rounded-full tabular-nums">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 2B: Full Desktop Navigation Links (1025px+) */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              const el = document.getElementById('accra-food-vendors');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#00875A] dark:hover:text-emerald-400 text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer font-bold"
            title="Popular Food Vendors in Accra"
          >
            <span>🍲 Food Vendors</span>
          </button>
          <button
            onClick={onGoHome}
            className="hover:text-[#00875A] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer font-bold"
          >
            Marketplace
          </button>
          {onOpenIWantThis && (
            <button
              onClick={onOpenIWantThis}
              className="text-[#FF6600] hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer font-extrabold"
              title="Post What You Want or View Buyer Requests"
            >
              <span>🔥 I Want This</span>
            </button>
          )}
          {onOpenCourierHub && (
            <button
              onClick={onOpenCourierHub}
              className="hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer text-[#00875A] dark:text-emerald-400 font-bold"
              title="Doorstep Courier Dispatch in Accra & Across Ghana"
            >
              <Truck size={16} />
              Accra Delivery
            </button>
          )}
          {onOpenMyOrders && (
            <button
              onClick={onOpenMyOrders}
              className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer"
              title="Track your orders"
            >
              <Package size={15} className="text-slate-400" />
              <span>My Orders</span>
            </button>
          )}
          {onOpenVendorDashboard && (
            <button
              onClick={onOpenVendorDashboard}
              className="hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer font-black text-[#00875A] dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-[#e6f7f0] dark:bg-emerald-950/50 border border-[#00875A]/20"
              title="Open Vendor Dashboard at /vendor"
            >
              <Store size={15} />
              <span>Vendor Dashboard</span>
            </button>
          )}
          <button
            onClick={onOpenSaved}
            className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer relative"
          >
            <Bookmark size={16} className="text-slate-400 dark:text-slate-400" />
            Saved
            {savedCount > 0 && (
              <span className="ml-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 rounded-full tabular-nums">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Global Theme Toggle + Cart + Auth Buttons / Profile + Primary CTA + Hamburger Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Shopping Cart Button */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-[#e6f7f0] dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-[#00875A]/25 text-[#00875A] dark:text-emerald-400 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group min-h-[40px] min-w-[40px] justify-center"
              title={`View Cart (${cartCount} items)`}
              aria-label="View shopping cart"
            >
              <ShoppingCart size={17} className="group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-[#FF6600] text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Desktop/Tablet Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-700 dark:text-amber-400 hover:text-slate-950 dark:hover:text-amber-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer hidden sm:flex items-center justify-center min-h-[40px] min-w-[40px]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun size={17} className="text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon size={17} className="text-slate-700 animate-in -spin-in-90 duration-300" />
              )}
            </button>
          )}

          {/* Desktop/Tablet User Auth State */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={isSeller && onOpenSellerDashboard ? onOpenSellerDashboard : onOpenProfile}
                  className="flex items-center gap-2 py-1 px-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-500/10 dark:bg-amber-950/40 hover:bg-amber-500/20 dark:hover:bg-amber-900/50 transition-all cursor-pointer group shadow-2xs"
                  title={`${currentUser.name} (${isBuyer ? 'Buyer Account' : 'Seller Account'})`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs ring-1 ring-white/20 ${
                      isBuyer
                        ? 'bg-gradient-to-tr from-sky-600 to-indigo-600'
                        : 'bg-gradient-to-tr from-amber-600 via-orange-500 to-red-600'
                    }`}
                  >
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(currentUser.name)
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1 max-w-[120px] truncate">
                      <span className="truncate">{currentUser.name.split(' ')[0]}</span>
                      {currentUser.isVerified && (
                        <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center min-h-[40px] min-w-[40px]"
                    title="Log Out"
                    aria-label="Log Out"
                  >
                    <LogOut size={15} />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:border-amber-500"
                  title="Log In"
                >
                  <LogIn size={14} className="text-amber-500" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Sign Up"
                >
                  <UserPlus size={14} className="text-amber-400" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop/Tablet Sell Product CTA */}
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth('register', 'seller');
              } else {
                onOpenPostAd();
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-[#00875A] hover:bg-[#00734c] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-98"
            title="Post an ad or list product on OGYA 🔥"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="flex items-center gap-1">
              <span>Sell</span>
              <span className="text-[#FF6600]">🔥</span>
            </span>
          </button>

          {/* Tablet & Mobile Search Icon / Button (Always visible on mobile & tablet, >= 44px) */}
          <button
            type="button"
            onClick={handleToggleMobileSearch}
            className={`lg:hidden min-h-[44px] min-w-[44px] px-2.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border shadow-xs active:scale-95 ${
              isMobileSearchOpen
                ? 'bg-amber-500 text-slate-950 border-amber-600 font-black ring-2 ring-amber-400/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 font-bold'
            }`}
            aria-label={isMobileSearchOpen ? 'Close Search Bar' : 'Open Search Bar'}
            title="Search Waakye, Jollof, Phones, Kente..."
          >
            <Search size={20} className={isMobileSearchOpen ? 'stroke-[2.5]' : ''} />
            <span className="hidden sm:inline text-xs font-black">Search</span>
          </button>

          {/* 1. PHONE MODE HAMBURGER MENU BUTTON (3 Lines) - Toggles all links */}
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(false); // Close search when menu toggles
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px] shadow-xs active:scale-95"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            title={isMobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
          >
            {isMobileMenuOpen ? (
              <X size={22} className="text-slate-900 dark:text-white" />
            ) : (
              <Menu size={22} className="text-slate-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* ================= TABLET & PHONE EXPANDABLE FULL-WIDTH SEARCH BAR (Below Header) ================= */}
      {isMobileSearchOpen && (
        <div
          ref={mobileSearchContainerRef}
          className="lg:hidden w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-2xl p-3 sm:p-4 animate-in slide-in-from-top-2 duration-150 relative z-50"
        >
          <div className="max-w-xl mx-auto space-y-2.5">
            {/* Input Row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative flex items-center bg-slate-100 dark:bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-inner min-h-[46px] px-3">
                <Search size={18} className="text-amber-500 shrink-0" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Search Waakye, Jollof, Phones, Kente..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTriggerSearch(searchQuery);
                    }
                  }}
                  className="w-full bg-transparent px-2.5 py-2 text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none caret-amber-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange('');
                      mobileInputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Clear text"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Big Clickable Search Button */}
              <button
                type="button"
                onClick={() => handleTriggerSearch(searchQuery)}
                className="min-h-[46px] px-4 sm:px-5 bg-[#00875A] hover:bg-[#00704a] active:bg-[#005a3c] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-md active:scale-95 transition-all"
                title="Search listings"
              >
                <span>Search</span>
                <span className="text-[#FF6600]">🔥</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="min-h-[46px] min-w-[46px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Close search bar"
                aria-label="Close search bar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Popular Suggestions Chips */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                <Sparkles size={12} className="text-amber-500" />
                <span>Suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      onSearchChange(suggestion);
                      handleTriggerSearch(suggestion);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-800 dark:text-slate-200 hover:text-amber-900 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer min-h-[36px] flex items-center gap-1 active:scale-95"
                  >
                    <span>{suggestion}</span>
                    <span className="text-[10px] text-amber-500">🔥</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PHONE MODE HAMBURGER MENU DRAWER (320px - 480px) ================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-50 bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          {/* User profile / login banner inside mobile menu */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={() => handleNavClick(isSeller && onOpenSellerDashboard ? onOpenSellerDashboard : onOpenProfile)}
                  className="flex items-center gap-2.5 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      getInitials(currentUser.name)
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      {currentUser.isVerified && <ShieldCheck size={12} className="text-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      {isBuyer ? 'Buyer Account' : 'Seller Account'}
                    </div>
                  </div>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => handleNavClick(onLogout)}
                    className="p-2 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    Log Out
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <button
                  type="button"
                  onClick={() => handleNavClick(() => onOpenAuth('signin'))}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <LogIn size={15} className="text-amber-500" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick(() => onOpenAuth('register'))}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <UserPlus size={15} className="text-amber-400" />
                  <span>Create Account</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Sell Button full width for easy thumb tap */}
          <button
            type="button"
            onClick={() => {
              handleNavClick();
              if (!currentUser) {
                onOpenAuth('register', 'seller');
              } else {
                onOpenPostAd();
              }
            }}
            className="w-full py-3.5 px-4 bg-[#00875A] hover:bg-[#00734c] active:bg-[#005a3c] text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all min-h-[48px]"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Sell Product on OGYA 🔥</span>
          </button>

          {/* All Navigation Links inside hamburger drawer */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                const el = document.getElementById('accra-food-vendors');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold text-sm transition-colors text-left min-h-[44px]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🍲</span>
                <span>Food Vendors (Accra Express)</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick(onGoHome)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold text-sm transition-colors text-left min-h-[44px]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🛒</span>
                <span>Marketplace (All Ghana Items)</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {onOpenIWantThis && (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenIWantThis)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-black text-sm transition-colors text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🔥</span>
                  <span>I WANT THIS - Post What You Want</span>
                </div>
                <ChevronRight size={16} className="text-orange-500" />
              </button>
            )}

            {onOpenCourierHub && (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenCourierHub)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-[#00875A] dark:text-emerald-400 font-bold text-sm transition-colors text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Truck size={18} />
                  <span>Accra Doorstep Delivery Hub</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            )}

            {onOpenMyOrders && (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenMyOrders)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold text-sm transition-colors text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Package size={18} className="text-slate-400" />
                  <span>My Orders & Delivery History</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            )}

            {onOpenVendorDashboard && (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenVendorDashboard)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 text-[#00875A] dark:text-emerald-400 font-black text-sm transition-colors text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Store size={18} />
                  <span>Vendor Dashboard Portal (/vendor)</span>
                </div>
                <ChevronRight size={16} className="text-[#00875A]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavClick(onOpenSaved)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold text-sm transition-colors text-left min-h-[44px]"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark size={18} className="text-slate-400" />
                <span>Saved Ads & Favorites</span>
              </div>
              {savedCount > 0 ? (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full tabular-nums">
                  {savedCount}
                </span>
              ) : (
                <ChevronRight size={16} className="text-slate-400" />
              )}
            </button>

            {onOpenSettings && (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenSettings)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold text-sm transition-colors text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span>Settings &amp; Legal (Escrow / Privacy)</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            )}
          </div>

          {/* Theme Switcher inside mobile drawer */}
          {onToggleTheme && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Appearance Mode
              </span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
              >
                {isDark ? (
                  <>
                    <Sun size={15} className="text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={15} className="text-slate-700" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
