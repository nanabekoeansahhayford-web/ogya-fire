import React from 'react';
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
  Flame,
  Package,
} from 'lucide-react';
import { UserProfile } from '../types/marketplace';
import { isUserBuyer, isUserSeller } from '../utils/auth';

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
  onScrollToStore?: () => void;
  isVendor?: boolean;
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
  onScrollToStore,
  isVendor = false,
}) => {
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={onGoHome}
          className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer text-left"
          title="OGYA 🔥 - Shop Local in Accra - Fast Delivery"
        >
          <span className="bg-gradient-to-tr from-[#00875A] via-emerald-600 to-[#FF6600] text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
            🔥
          </span>
          <span className="tracking-tight flex items-center gap-1.5">
            <span className="text-slate-950 dark:text-white">OGYA</span>
            <span className="text-[#FF6600] text-xs sm:text-sm font-black tracking-wider uppercase">
              FIRE
            </span>
            <span aria-hidden="true" className="text-xl">
              🔥
            </span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
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
            onClick={onScrollToStore || onGoHome}
            className="hover:text-[#FF6600] dark:hover:text-[#FF6600] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer font-bold text-[#FF6600]"
            title="Fire Protection & Safety Equipment Store"
          >
            <Flame size={16} className="text-[#FF6600]" />
            <span>Fire Gear Store</span>
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
          <button
            onClick={onOpenCourierHub}
            className="hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer text-[#00875A] dark:text-emerald-400 font-bold"
            title="Doorstep Courier Dispatch in Accra & Across Ghana"
          >
            <Truck size={16} />
            Accra Delivery
          </button>
          {onOpenMyOrders && (
            <button
              onClick={onOpenMyOrders}
              className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer"
              title="Track your fire gear orders"
            >
              <Package size={15} className="text-slate-400" />
              <span>My Orders</span>
            </button>
          )}
          {onOpenVendorDashboard && (
            <button
              onClick={onOpenVendorDashboard}
              className="hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 cursor-pointer font-black text-[#00875A] dark:text-emerald-400 px-2 py-0.5 rounded-lg bg-[#e6f7f0] dark:bg-emerald-950/50 border border-[#00875A]/20"
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

        {/* Zone 3: Global Theme Toggle + Cart + Auth Buttons / Profile + Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Shopping Cart Button */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-[#e6f7f0] dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-[#00875A]/25 text-[#00875A] dark:text-emerald-400 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
              title={`View Cart (${cartCount} items)`}
              aria-label="View shopping cart"
            >
              <ShoppingCart size={17} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-[#FF6600] text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Orders quick button if logged in */}
          {currentUser && onOpenMyOrders && (
            <button
              type="button"
              onClick={onOpenMyOrders}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 transition-colors cursor-pointer"
              title="My Orders"
              aria-label="View my orders"
            >
              <Package size={18} />
            </button>
          )}

          {/* Mobile Ghana Courier Quick Icon */}
          {onOpenCourierHub && (
            <button
              onClick={onOpenCourierHub}
              className="md:hidden p-2 text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
              title="Ghana Door-to-Door Courier Hub"
              aria-label="Door-to-door courier service"
            >
              <Truck size={19} />
            </button>
          )}

          {/* Global Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-700 dark:text-amber-400 hover:text-slate-950 dark:hover:text-amber-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer flex items-center justify-center"
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

          {/* Mobile bookmark icon */}
          <button
            onClick={onOpenSaved}
            className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer relative"
            aria-label="View Saved Ads"
          >
            <Bookmark size={18} />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {/* ================= USER AUTH STATE (LOGGED IN vs LOGGED OUT) ================= */}
          {currentUser ? (
            /* USER IS LOGGED IN */
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Buyer or Seller Account Capsule */}
              <button
                onClick={isSeller && onOpenSellerDashboard ? onOpenSellerDashboard : onOpenProfile}
                className="flex items-center gap-2 py-1 px-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-500/10 dark:bg-amber-950/40 hover:bg-amber-500/20 dark:hover:bg-amber-900/50 transition-all cursor-pointer group shadow-2xs"
                title={`${currentUser.name} (${isBuyer ? 'Buyer Account' : 'Seller Account'})`}
              >
                <div className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs ring-1 ring-white/20 ${
                  isBuyer
                    ? 'bg-gradient-to-tr from-sky-600 to-indigo-600'
                    : 'bg-gradient-to-tr from-amber-600 via-orange-500 to-red-600'
                }`}>
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
                <div className="text-left hidden xs:block">
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1 max-w-[130px] truncate">
                    <span className="truncate">{currentUser.name.split(' ')[0]}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1 py-0.2 rounded ${
                        isBuyer
                          ? 'bg-sky-200/80 dark:bg-sky-900/80 text-sky-900 dark:text-sky-200'
                          : 'bg-amber-200/70 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      {isBuyer ? 'Buyer' : 'Seller'}
                    </span>
                    {currentUser.isVerified && (
                      <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold -mt-0.5 truncate max-w-[130px]">
                    {isBuyer ? 'Orders & Saved' : 'Dashboard & Ads'}
                  </div>
                </div>
              </button>

              {/* Direct Log Out Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/60 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
                  title={`Log out from ${currentUser.name}`}
                  aria-label="Log Out"
                >
                  <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              )}
            </div>
          ) : (
            /* USER IS LOGGED OUT: DISPLAY LOG IN & CREATE ACCOUNT BUTTONS */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:border-amber-500"
                title="Log In as Buyer or Seller"
              >
                <LogIn size={15} className="text-amber-500" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="py-1.5 sm:py-2 px-2.5 sm:px-3.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border border-transparent dark:border-slate-700 hover:scale-102 active:scale-98"
                title="Create a Free Buyer or Seller Account"
              >
                <UserPlus size={15} className="text-amber-400" />
                <span className="hidden xs:inline">Create Account</span>
                <span className="xs:hidden">Sign Up</span>
              </button>
            </div>
          )}

          {/* I WANT THIS CTA */}
          {onOpenIWantThis && (
            <button
              onClick={onOpenIWantThis}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-98"
              title="Post what you want to buy - Tell Ghana sellers"
            >
              <span>🔥</span>
              <span className="hidden xs:inline">I WANT THIS</span>
              <span className="xs:hidden">Want</span>
            </button>
          )}

          {/* Primary Sell Product CTA */}
          <button
            onClick={() => {
              if (!currentUser) {
                // Prompt seller account creation or login
                onOpenAuth('register', 'seller');
              } else {
                onOpenPostAd();
              }
            }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#00875A] hover:bg-[#00734c] active:bg-[#005a3c] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap shrink-0 cursor-pointer group active:scale-98"
            title="Post an ad or list product on OGYA 🔥"
          >
            <Plus size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
            <span className="flex items-center gap-1">
              <span>Sell Product</span>
              <span className="text-[#FF6600] text-sm">🔥</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
