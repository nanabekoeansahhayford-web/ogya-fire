import React, { useState } from 'react';
import { FoodVendor, FoodMenuItem } from '../data/foodVendors';
import { X, Star, Clock, Bike, ShieldCheck, MapPin, Plus, Check, ShoppingBag } from 'lucide-react';

interface FoodVendorModalProps {
  vendor: FoodVendor | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: FoodMenuItem, vendor: FoodVendor) => void;
  getItemQuantityInCart?: (itemId: string) => number;
}

export const FoodVendorModal: React.FC<FoodVendorModalProps> = ({
  vendor,
  isOpen,
  onClose,
  onAddToCart,
  getItemQuantityInCart = () => 0,
}) => {
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  if (!isOpen || !vendor) return null;

  const handleAdd = (item: FoodMenuItem) => {
    onAddToCart(item, vendor);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors cursor-pointer shadow-md"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Vendor Header Image */}
        <div className="relative h-52 sm:h-64 w-full bg-slate-900 overflow-hidden">
          <img
            src={vendor.imageUrl}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-[#00875A] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck size={13} />
              <span>Verified OGYA Vendor</span>
            </span>
            <span className="bg-[#FF6600] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              Delivery ₵{vendor.deliveryFee}.00
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-300 mb-1">
              <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{vendor.rating}</span>
                <span className="text-slate-300">({vendor.reviewCount}+ ratings)</span>
              </span>
              <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs text-white">
                <Clock size={13} className="text-emerald-400" />
                <span>{vendor.deliveryTime}</span>
              </span>
              <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs text-white">
                <MapPin size={13} className="text-amber-400" />
                <span>{vendor.neighborhood}, {vendor.city}</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              {vendor.name}
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {vendor.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Quick Notice */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00875A] text-white flex items-center justify-center font-bold shrink-0">
                <Bike size={16} />
              </div>
              <div>
                <p className="font-bold text-emerald-900 dark:text-emerald-200">
                  Direct Express Dispatch in {vendor.neighborhood}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400">
                  Flat ₵{vendor.deliveryFee} delivery. Packed fresh and delivered warm.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold text-[#00875A] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {vendor.deliveryTime}
              </span>
            </div>
          </div>

          {/* Menu Section */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#FF6600]" />
              <span>Full Menu & Dishes</span>
            </h3>

            <div className="space-y-3">
              {vendor.menu.map((dish) => {
                const countInCart = getItemQuantityInCart(dish.id);
                const isJustAdded = addedItemIds[dish.id];

                return (
                  <div
                    key={dish.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#00875A] dark:hover:border-[#00875A] bg-white dark:bg-slate-800/70 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#00875A] transition-colors">
                          {dish.name}
                        </span>
                        {dish.isPopular && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                            Popular 🔥
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-base font-black text-[#00875A] dark:text-emerald-400">
                          ₵ {dish.price.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({dish.price} GHS)
                        </span>
                        {countInCart > 0 && (
                          <span className="text-xs font-bold text-[#FF6600] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-md">
                            {countInCart} in cart
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      <button
                        onClick={() => handleAdd(dish)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#FF6600] hover:bg-[#e65c00] text-white'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check size={14} className="stroke-[3]" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} className="stroke-[3]" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Delivery within {vendor.deliveryTime} across {vendor.neighborhood} & Accra</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            Close Menu
          </button>
        </div>
      </div>
    </div>
  );
};
