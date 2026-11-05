import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  SlidersHorizontal,
  Plus,
  Eye,
  Tag,
  Package,
} from 'lucide-react';
import { Product, ProductCategory, PRODUCT_CATEGORIES } from '../types/store';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onOpenBecomeVendor: () => void;
  onOpenVendorDashboard?: () => void;
  isVendor?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  onViewProduct,
  onOpenBecomeVendor,
  onOpenVendorDashboard,
  isVendor = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="fire-safety-products" className="py-10 bg-slate-50/70 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7f0] dark:bg-emerald-950/60 border border-[#00875A]/25 text-[#00875A] dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00875A] animate-pulse" />
              <span>OGYA VENDOR STORE · GNFS CERTIFIED SAFETY GEAR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Fire Safety & Protection Equipment
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Buy directly from verified Ghana fire safety merchants in Accra with same-day doorstep courier dispatch and Mobile Money verification.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenVendorDashboard && (
              <button
                type="button"
                onClick={onOpenVendorDashboard}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#00734c] text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                title="Go to /vendor"
              >
                <Store size={15} />
                <span>Vendor Dashboard (/vendor)</span>
              </button>
            )}
            {!isVendor && onOpenBecomeVendor && (
              <button
                type="button"
                onClick={onOpenBecomeVendor}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-900 dark:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer transition-all"
              >
                <Store size={15} className="text-[#FF6600]" />
                <span>Become an OGYA Vendor</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4 mb-7">
          {/* Search bar and sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fire extinguishers, smoke detectors, blankets, hoses, alarms..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-red-500 shadow-2xs font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer shadow-2xs"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills (Mobile scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#00875A] text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              All Gear ({products.length})
            </button>

            {PRODUCT_CATEGORIES.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#00875A] text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Package size={26} />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              No fire safety equipment found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Try adjusting your search terms or choose another category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-red-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Products Grid: Responsive, Mobile-First */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => {
              const inStock = product.stock > 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;

              return (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-750 hover:border-red-500/50 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Image & Badge */}
                  <div
                    className="relative aspect-4/3 bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer"
                    onClick={() => onViewProduct(product)}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Category pill */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                      {product.category}
                    </span>

                    {/* Stock pill */}
                    <div className="absolute top-2.5 right-2.5">
                      {inStock ? (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-xs ${
                            isLowStock
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isLowStock
                            ? `Only ${product.stock} left`
                            : `${product.stock} in stock`}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Vendor name */}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">
                        <Store size={12} className="text-amber-500 shrink-0" />
                        <span className="truncate">{product.vendorName}</span>
                      </div>

                      {/* Product Title */}
                      <h3
                        onClick={() => onViewProduct(product)}
                        className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 hover:text-red-600 transition-colors cursor-pointer leading-snug"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price and Big Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Direct Price
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-black text-[#00875A] dark:text-emerald-400">₵</span>
                            <span className="text-xl font-black text-slate-950 dark:text-white tabular-nums tracking-tight">
                              {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] font-black uppercase text-slate-400 ml-0.5">GHS</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#00875A] dark:text-emerald-400 font-extrabold bg-[#e6f7f0] dark:bg-emerald-950/60 border border-[#00875A]/20 px-2 py-0.5 rounded-md">
                          MoMo / COD
                        </span>
                      </div>

                      {/* Big Mobile-First Add to Cart Button */}
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => onViewProduct(product)}
                          className="col-span-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                          title="Quick view product specs"
                          aria-label="Quick view"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          disabled={!inStock}
                          onClick={() => onAddToCart(product)}
                          className="col-span-3 py-2.5 px-3 rounded-xl bg-[#00875A] hover:bg-[#00734c] active:bg-[#005a3c] text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
                        >
                          <ShoppingCart size={15} />
                          <span>{inStock ? 'Add to Cart' : 'Sold Out'}</span>
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
    </section>
  );
};
