import React, { useState } from 'react';
import { FOOD_VENDORS, FoodVendor, FoodMenuItem } from '../data/foodVendors';
import { FoodVendorModal } from './FoodVendorModal';
import {
  Star,
  Clock,
  Bike,
  Plus,
  Check,
  ShieldCheck,
  MapPin,
  Flame,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';

interface FoodVendorsSectionProps {
  onAddToCart: (item: FoodMenuItem, vendor: FoodVendor) => void;
  cartItemCount?: number;
  getItemQuantityInCart?: (itemId: string) => number;
}

export const FoodVendorsSection: React.FC<FoodVendorsSectionProps> = ({
  onAddToCart,
  getItemQuantityInCart = () => 0,
}) => {
  const [selectedVendorForModal, setSelectedVendorForModal] = useState<FoodVendor | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('All');
  const [recentAddedItem, setRecentAddedItem] = useState<string | null>(null);

  const neighborhoods = ['All', 'Osu', 'East Legon', 'Madina', 'Spintex', 'Adenta', 'Cantonments'];

  const filteredVendors = selectedNeighborhood === 'All'
    ? FOOD_VENDORS
    : FOOD_VENDORS.filter((v) => v.neighborhood.toLowerCase() === selectedNeighborhood.toLowerCase());

  const handleAddItem = (item: FoodMenuItem, vendor: FoodVendor, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item, vendor);
    setRecentAddedItem(item.id);
    setTimeout(() => {
      setRecentAddedItem(null);
    }, 1200);
  };

  return (
    <section id="accra-food-vendors" className="w-full bg-[#FAFBFC] dark:bg-[#0c121e] py-10 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Jumia/Bolt Food Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00875A]/10 text-[#00875A] dark:bg-[#00875A]/20 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame size={14} className="text-[#FF6600]" />
              <span>Accra Food Express & Local Kitchens</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00875A]" />
              <span>Fast 15-35 Min Delivery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Featured Food Vendors in Accra 🇬🇭
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Authentic Ghanaian hot dishes, fresh juices, pizzas, and grills from top neighborhood spots. Flat ₵10 courier delivery right to your door.
            </p>
          </div>

          {/* Neighborhood Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline-flex items-center gap-1">
              <Filter size={12} /> Area:
            </span>
            {neighborhoods.map((loc) => {
              const active = selectedNeighborhood === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedNeighborhood(loc)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#00875A] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Demo Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group hover:border-[#00875A]/60"
            >
              {/* Vendor Image Banner */}
              <div
                className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => setSelectedVendorForModal(vendor)}
              >
                <img
                  src={vendor.imageUrl}
                  alt={vendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Delivery Time & Delivery Fee Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-xs text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Clock size={12} className="text-[#00875A]" />
                    <span>{vendor.deliveryTime}</span>
                  </span>
                  <span className="bg-[#FF6600] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Bike size={12} />
                    <span>₵{vendor.deliveryFee} Delivery</span>
                  </span>
                </div>

                {/* Verified Badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-[#00875A] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck size={12} />
                    <span>Verified</span>
                  </span>
                </div>

                {/* Bottom of Image: Name & Location */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 bg-amber-500/90 text-slate-950 font-black text-xs px-2 py-0.5 rounded-md">
                        <Star size={12} className="fill-slate-950" />
                        <span>{vendor.rating}</span>
                      </span>
                      <span className="text-xs text-slate-200">
                        ({vendor.reviewCount} reviews)
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-200 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <MapPin size={11} className="text-amber-400" />
                      <span>{vendor.neighborhood}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-black tracking-tight text-white mt-1 group-hover:text-amber-200 transition-colors">
                    {vendor.name}
                  </h3>
                </div>
              </div>

              {/* Tags Strip */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-600 dark:text-slate-300">
                {vendor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md shrink-0 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Menu Items with Direct Add-to-Cart */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span>Popular Dishes</span>
                    <button
                      onClick={() => setSelectedVendorForModal(vendor)}
                      className="text-[#00875A] hover:underline flex items-center gap-0.5 lowercase font-semibold cursor-pointer"
                    >
                      <span>view full menu</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  {vendor.menu.map((dish) => {
                    const quantity = getItemQuantityInCart(dish.id);
                    const isJustAdded = recentAddedItem === dish.id;

                    return (
                      <div
                        key={dish.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {dish.name}
                            </span>
                            {dish.isPopular && (
                              <span className="text-[9px] font-black uppercase text-[#FF6600] bg-orange-100 dark:bg-orange-950/70 px-1.5 py-0.2 rounded-sm shrink-0">
                                HOT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-[#00875A] dark:text-emerald-400">
                              ₵ {dish.price.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({dish.price} GHS)
                            </span>
                            {quantity > 0 && (
                              <span className="text-[10px] font-bold text-[#FF6600] bg-white dark:bg-slate-900 px-1.5 rounded border border-orange-200 dark:border-orange-900/50">
                                {quantity} in cart
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct Add Button */}
                        <button
                          type="button"
                          onClick={(e) => handleAddItem(dish, vendor, e)}
                          title={`Add ${dish.name} to cart (₵${dish.price})`}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#00875A] hover:bg-[#00704a] text-white'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check size={13} className="stroke-[3]" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus size={13} className="stroke-[3]" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedVendorForModal(vendor)}
                    className="w-full py-2 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-[#FF6600]" />
                    <span>Order from {vendor.name.split(' ')[0]}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Vendor Detail & Menu Modal */}
      <FoodVendorModal
        vendor={selectedVendorForModal}
        isOpen={Boolean(selectedVendorForModal)}
        onClose={() => setSelectedVendorForModal(null)}
        onAddToCart={onAddToCart}
        getItemQuantityInCart={getItemQuantityInCart}
      />
    </section>
  );
};
