import React from 'react';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Package,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { CartItem } from '../types/store';
import { getCartTotal } from '../utils/cartStorage';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const total = getCartTotal(cart);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleProceedClick = () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items before proceeding to checkout.');
      return;
    }
    onProceedToCheckout();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="cart-modal-backdrop"
    >
      <div
        className="relative w-full max-w-xl h-[100dvh] sm:h-auto sm:max-h-[88vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight leading-tight">
                  Fire Safety Cart
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-black uppercase tracking-wider">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-[11px] text-white/90">
                GNFS Certified Fire Equipment & Safety Supplies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs font-bold text-white/90 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-black/20 transition-colors cursor-pointer"
                title="Clear all cart items"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/90 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-0 bg-slate-50/60 dark:bg-slate-900/60">
          {cart.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-sm">
                <ShoppingCart size={30} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Your cart is currently empty
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  Browse certified fire extinguishers, smoke alarms, fire blankets, and hoses to safeguard your home or workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Flame size={14} />
                <span>Explore Fire Safety Store</span>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3.5 transition-all"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700/60 overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider">
                    <span>{item.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 mt-0.5">
                    GHS {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 cursor-pointer text-xs transition-colors"
                      title="Decrease quantity"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.stock}
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 cursor-pointer text-xs disabled:opacity-30 transition-colors"
                      title="Increase quantity"
                      aria-label="Increase quantity"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-950 dark:text-white">
                      GHS {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors p-0.5"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ALWAYS VISIBLE AT BOTTOM: Total in GHS and Big 'Proceed to Checkout' Button (Even on Mobile) */}
        <div className="shrink-0 sticky bottom-0 z-20 p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_24px_rgba(0,0,0,0.1)] space-y-3">
          {/* Subtotal & Delivery note */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span>Delivery Dispatch (Ghana 16 Regions)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                MoMo / Telecel / COD Ready
              </span>
            </div>

            {/* Total Display in GHS */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block">
                  Total in GHS
                </span>
                <span className="text-[10px] text-slate-400">All prices in Ghana Cedis</span>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tabular-nums">
                  GHS {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Big 'Proceed to Checkout' Button */}
          <button
            type="button"
            onClick={handleProceedClick}
            disabled={cart.length === 0}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-red-500/25 flex items-center justify-center gap-2.5 cursor-pointer transition-all"
            aria-label="Proceed to Checkout"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={20} className="shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
