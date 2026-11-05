import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  Flame,
  Truck,
  Plus,
  Minus,
  Phone,
} from 'lucide-react';
import { Product } from '../types/store';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const inStock = product.stock > 0;
  const maxQty = Math.max(1, product.stock);

  const handleIncrement = () => {
    if (quantity < maxQty) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-auto bg-slate-100 dark:bg-slate-800">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-white">
                {product.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-black uppercase">
                GNFS Certified
              </span>
            </div>
          </div>

          {/* Details & Purchase Column */}
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Vendor & Stock Status */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                  <Store size={14} className="text-amber-500" />
                  <span>{product.vendorName}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    inStock
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {inStock ? `${product.stock} Available in Ghana` : 'Out of Stock'}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                {product.name}
              </h3>

              {/* Price */}
              <div className="p-3 bg-red-500/5 dark:bg-red-950/30 border border-red-500/20 rounded-2xl flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Price in Ghana Cedis
                  </span>
                  <span className="text-2xl font-black text-red-600 dark:text-red-400">
                    GH₵ {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Fast Delivery</span>
                  <div className="text-emerald-600 dark:text-emerald-400">MTN MoMo Accepted</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Product Overview
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                  {product.description}
                </p>
              </div>

              {/* Quick Perks */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Verified Original</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-sky-600 shrink-0" />
                  <span>Same-Day Dispatch</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quantity + Big Add to Cart */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {inStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quantity:
                  </span>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-2xs"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-white tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= maxQty}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-2xs"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!inStock}
                onClick={handleAdd}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:opacity-95 active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                <span>
                  {inStock
                    ? `Add ${quantity} to Cart (GH₵ ${(product.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })})`
                    : 'Out of Stock'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
