import React from 'react';
import { ShoppingCart, Store, Star, ShieldCheck, Package, Tag } from 'lucide-react';
import {
  Product,
  PRODUCT_CATEGORIES,
  matchesProductCategoryFilter,
  normalizeProductCategory,
} from '../types/store';
import { CategoryId } from '../types/marketplace';
import { isTestProduct } from '../utils/firebase';

interface StoreProductsSectionProps {
  products: Product[];
  selectedCategory: CategoryId | 'all';
  searchQuery: string;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectCategory?: (category: CategoryId | 'all') => void;
}

const CATEGORY_TO_NAV_ID: Record<string, CategoryId> = {
  'Food': 'food',
  'Phones': 'phones-tablets',
  'Laptops': 'laptops',
  'Cars': 'vehicles',
  'Car Accessories': 'accessories',
  'Phone Accessories': 'accessories',
  'Fashion': 'fashion',
  'Home Items': 'home-furniture',
  'Electronics': 'electronics',
};

export const StoreProductsSection: React.FC<StoreProductsSectionProps> = ({
  products,
  selectedCategory,
  searchQuery,
  onSelectProduct,
  onAddToCart,
  onSelectCategory,
}) => {
  const cleanProducts = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (isTestProduct(p)) return false;
      if (!matchesProductCategoryFilter(p, selectedCategory)) return false;
      if (q) {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        const matchVendor = (p.vendorName || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat && !matchVendor) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Group products by normalized category so buyers can browse organized sections
  const groupedByCategory = React.useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const p of cleanProducts) {
      const rawCat = (p.category || '').trim();
      const label = PRODUCT_CATEGORIES.includes(rawCat)
        ? rawCat
        : normalizeProductCategory(rawCat);
      const list = groups.get(label) || [];
      list.push(p);
      groups.set(label, list);
    }
    return Array.from(groups.entries());
  }, [cleanProducts]);

  if (cleanProducts.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Vendor Store Products Organized by Category"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white flex items-center gap-2 flex-wrap">
              <span>🛍️ Verified Store Products</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-[#00875A] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {cleanProducts.length} {cleanProducts.length === 1 ? 'Product' : 'Products'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct checkout with MTN MoMo, Telecel Cash, or Cash on Delivery across Food, Phones, Laptops, Cars & Accessories.
            </p>
          </div>

          {onSelectCategory && selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="self-start sm:self-auto text-xs font-bold text-[#FF6600] hover:underline cursor-pointer"
            >
              Show All Categories
            </button>
          )}
        </div>

        <div className="space-y-6">
          {groupedByCategory.map(([categoryLabel, items]) => (
            <div key={categoryLabel} className="space-y-3">
              {/* Category Header Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black border border-slate-200 dark:border-slate-700">
                    <Tag size={12} className="text-[#FF6600]" />
                    <span>{categoryLabel}</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      ({items.length})
                    </span>
                  </span>
                </div>
                {onSelectCategory && CATEGORY_TO_NAV_ID[categoryLabel] && selectedCategory === 'all' && (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(CATEGORY_TO_NAV_ID[categoryLabel])}
                    className="text-[11px] font-bold text-[#00875A] dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Filter {categoryLabel} →
                  </button>
                )}
              </div>

              {/* Responsive Product Cards Grid: 2 on phone, 3 on tablet, 4 on PC */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {items.map((product) => {
                  const inStock = product.stock > 0;
                  const isDaniel = product.vendorId === 'vnd-daniel-arnan' || product.vendorName.toLowerCase().includes('daniel');

                  return (
                    <div
                      key={product.id}
                      onClick={() => onSelectProduct(product)}
                      className="group bg-slate-50/70 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-[4/3] w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[10px] font-bold text-white truncate max-w-[75%]">
                          {product.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                        <div className="space-y-1.5">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#FF6600] transition-colors">
                            {product.name}
                          </h3>

                          {/* Trust & Verification Badges */}
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                              <span>✅</span>
                              <span>MoMo Verified</span>
                            </span>
                            {isDaniel && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black border border-amber-200 dark:border-amber-800">
                                <span>⭐</span>
                                <span>Trusted</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            <Store size={11} className="text-amber-500 shrink-0" />
                            <span className="truncate font-semibold">{product.vendorName}</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white tabular-nums">
                              GH₵ {Number(product.price).toLocaleString('en-US')}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              <span>4.9</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={!inStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            className="w-full min-h-[38px] py-2 px-3 rounded-xl bg-[#00875A] hover:bg-[#00704a] active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <ShoppingCart size={13} />
                            <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
