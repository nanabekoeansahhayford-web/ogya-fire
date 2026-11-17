import React, { useRef } from 'react';
import {
  Plus,
  Bookmark,
  ShieldCheck,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Truck,
  ShoppingCart,
  Store,
  Package,
  Search,
  X,
  Flame,
  User,
} from 'lucide-react';
import { UserProfile } from '../types/marketplace';
import { isUserBuyer, isUserSeller } from '../utils/auth';
import { PWAInstallButton } from './PWAInstallPrompt';

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
  onOpenVendorDashboard,
  searchQuery = '',
  onSearchChange = () => {},
  onExecuteSearch,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleTriggerSearch = (queryToSearch = searchQuery) => {
    onSearchChange(queryToSearch);
    if (onExecuteSearch) {
      onExecuteSearch(queryToSearch);
    } else {
      setTimeout(() => {
        const el = document.getElementById('browse-listings') || document.querySelector('main');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  const handleScrollToFoodVendors = () => {
    const el = document.getElementById('accra-food-vendors');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSellClick = () => {
    if (!currentUser) {
      onOpenAuth('register', 'seller');
    } else {
      onOpenPostAd();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-2xs">
      {/* ================= ROW 1 (TOP BAR): Logo + Full Search Bar + Action Icons ================= */}
      {/* Phone (<640px): Row 1 = Logo + Cart only; Search Bar wraps to Row 2 at 100% width */}
      {/* Tablet (768px) & Desktop (1280px): Logo (left) + Flex-1 Search Bar (min-w-[300px]) + Cart/Saved/Theme/Login (right) */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 lg:gap-4">
        {/* Left: OGYA (FIRE) Logo */}
        <button
          type="button"
          onClick={onGoHome}
          className="order-1 text-lg sm:text-xl font-black tracking-tight text-slate-950 dark:text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer text-left"
          title="OGYA (FIRE) - Ghana Marketplace"
        >
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sm shrink-0 bg-[#FF6B00]">
            <img
              src="/assets/aistudio/OGYA_SPECIAL_11_d4fab9c1.webp"
              alt="OGYA (FIRE) Logo"
              className="w-full h-full object-cover scale-[1.06]"
            />
          </span>
          <span className="tracking-tight flex items-center gap-1">
            <span className="text-slate-950 dark:text-white">OGYA</span>
            <span className="text-[#FF6600] text-xs sm:text-sm font-black tracking-wider uppercase">
              (FIRE)
            </span>
          </span>
        </button>

        {/* Middle (Wraps to Row 2 full width on Phone <640px; flex-1 min-w-[300px] on Tablet/Desktop): Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTriggerSearch(searchQuery);
          }}
          className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:min-w-[300px] flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl hover:border-[#FF6600] focus-within:border-[#FF6600] focus-within:ring-2 focus-within:ring-orange-500/20 transition-all shadow-inner min-h-[44px]"
          role="search"
          aria-label="Search OGYA Marketplace"
        >
          <Search size={18} className="text-slate-400 dark:text-slate-500 ml-3 shrink-0" />
          <input
            ref={searchInputRef}
            id="header-search-input"
            type="search"
            placeholder="Search for phones, food, cars, properties..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 min-w-0 bg-transparent px-2.5 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none caret-amber-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                searchInputRef.current?.focus();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors shrink-0"
              title="Clear search text"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="submit"
            className="m-1 px-3.5 sm:px-4 py-2 bg-[#00875A] hover:bg-[#00704a] active:bg-[#005a3c] text-white font-black text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all shrink-0 active:scale-95 whitespace-nowrap"
            title="Search OGYA (FIRE)"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Right: Cart (Always visible — Phone shows Cart only here; Tablet/Desktop shows Cart + Saved + Theme + Login) */}
        <div className="order-2 sm:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden xl:flex items-center">
            <PWAInstallButton />
          </div>

          {/* Cart Icon */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative px-2.5 py-2 rounded-xl bg-[#e6f7f0] dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-[#00875A]/30 text-[#00875A] dark:text-emerald-400 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] min-w-[42px]"
              title={`View Cart (${cartCount} items)`}
              aria-label={`View shopping cart (${cartCount} items)`}
            >
              <ShoppingCart size={18} />
              <span className="hidden lg:inline">Cart</span>
              {cartCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-[#FF6600] text-white font-black text-[10px] flex items-center justify-center tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Saved Icon (Tablet & Desktop) */}
          <button
            type="button"
            onClick={onOpenSaved}
            className="hidden sm:flex relative px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer items-center justify-center gap-1.5 min-h-[42px] min-w-[42px]"
            title={`Saved Items (${savedCount})`}
            aria-label={`Saved items (${savedCount})`}
          >
            <Bookmark size={17} />
            {savedCount > 0 && (
              <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center tabular-nums">
                {savedCount}
              </span>
            )}
          </button>

          {/* Theme Toggle (Tablet & Desktop) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="hidden sm:flex p-2 text-slate-700 dark:text-amber-400 hover:text-slate-950 dark:hover:text-amber-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer items-center justify-center min-h-[42px] min-w-[42px]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>
          )}

          {/* Login / Account Button (Tablet & Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={isSeller && onOpenSellerDashboard ? onOpenSellerDashboard : onOpenProfile}
                  className="flex items-center gap-2 py-1 px-2 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-500/10 dark:bg-amber-950/40 hover:bg-amber-500/20 dark:hover:bg-amber-900/50 transition-all cursor-pointer min-h-[42px]"
                  title={`${currentUser.name} (${isBuyer ? 'Buyer Account' : 'Seller Account'})`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-white font-black text-xs shrink-0 ${
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
                  <span className="hidden lg:flex items-center gap-1 text-xs font-black text-slate-900 dark:text-slate-100 max-w-[90px] truncate">
                    <span className="truncate">{currentUser.name.split(' ')[0]}</span>
                    {currentUser.isVerified && (
                      <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                    )}
                  </span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer items-center justify-center min-h-[42px] min-w-[42px]"
                    title="Log Out"
                    aria-label="Log Out"
                  >
                    <LogOut size={15} />
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:border-[#FF6600] min-h-[42px] whitespace-nowrap"
                title="Log In"
              >
                <LogIn size={15} className="text-[#FF6600]" />
                <span>Log In</span>
              </button>
            )}
          </div>

          {/* Primary Sell CTA on Desktop (>=1024px) */}
          <button
            type="button"
            onClick={handleSellClick}
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00875A] hover:bg-[#00734c] text-white font-black text-xs rounded-xl shadow-sm hover:shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
            title="Sell Product on OGYA (FIRE)"
          >
            <Plus size={15} strokeWidth={2.75} />
            <span>Sell</span>
            <Flame size={13} className="text-amber-300 fill-amber-300" />
          </button>
        </div>
      </div>

      {/* ================= ROW 2 (NAV BAR — Row 3 on Mobile): Horizontally Scrollable, No Wrapping, 20px Gap ================= */}
      <nav
        aria-label="Marketplace Navigation"
        className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60"
      >
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 flex items-center gap-[20px] overflow-x-auto no-scrollbar py-2 touch-pan-x">
          <button
            type="button"
            onClick={onGoHome}
            className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-[#00875A] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Marketplace</span>
          </button>

          {onOpenIWantThis && (
            <button
              type="button"
              onClick={onOpenIWantThis}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold text-[#FF6600] hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Post What You Want or View Buyer Requests"
            >
              <span>🔥 I Want This</span>
            </button>
          )}

          {onOpenCourierHub && (
            <button
              type="button"
              onClick={onOpenCourierHub}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-[#00875A] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Doorstep Courier Dispatch in Accra & Across Ghana"
            >
              <Truck size={15} />
              <span>Accra Delivery</span>
            </button>
          )}

          {onOpenMyOrders && (
            <button
              type="button"
              onClick={onOpenMyOrders}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Track your orders"
            >
              <Package size={15} className="text-slate-400" />
              <span>My Orders</span>
            </button>
          )}

          {onOpenVendorDashboard && (
            <button
              type="button"
              onClick={onOpenVendorDashboard}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black text-[#00875A] dark:text-emerald-400 bg-[#e6f7f0] dark:bg-emerald-950/50 border border-[#00875A]/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Open Vendor Dashboard at /vendor"
            >
              <Store size={15} />
              <span>Vendor Dashboard</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSaved}
            className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Bookmark size={15} className="text-slate-400" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-full tabular-nums">
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleScrollToFoodVendors}
            className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-[#00875A] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Popular Food Vendors in Accra"
          >
            <span>🍲 Food Vendors</span>
          </button>

          {onOpenVerifiedSubscription && (
            <button
              type="button"
              onClick={onOpenVerifiedSubscription}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck size={15} />
              <span>Become Verified</span>
            </button>
          )}

          {/* Quick Sell action inside scrollable nav for Phone & Tablet (<1024px) */}
          <button
            type="button"
            onClick={handleSellClick}
            className="lg:hidden whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs font-black bg-[#00875A] text-white hover:bg-[#00734c] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Sell Item</span>
          </button>

          {/* Phone-only Login / Profile & Theme access inside scrollable nav so Row 1 stays strictly Logo + Cart */}
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                if (isSeller && onOpenSellerDashboard) {
                  onOpenSellerDashboard();
                } else {
                  onOpenProfile();
                }
              } else {
                onOpenAuth('signin');
              }
            }}
            className="sm:hidden whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <User size={14} className="text-[#FF6600]" />
            <span>{currentUser ? currentUser.name.split(' ')[0] : 'Log In'}</span>
          </button>

          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="sm:hidden whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
