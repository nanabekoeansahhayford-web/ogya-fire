import React, { useState } from 'react';
import { Filter, RotateCcw, CheckCircle2, SlidersHorizontal, LocateFixed, Loader2, MapPin, AlertCircle, Award, Zap, ShieldCheck } from 'lucide-react';
import { CATEGORIES, REGIONS } from '../data/categories';
import { CategoryId, FilterState, SellerBadgeId } from '../types/marketplace';
import { detectUserCityOrRegion, DetectedLocation } from '../utils/geolocation';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const currentCategory = CATEGORIES.find((c) => c.id === filters.category);

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const cached = sessionStorage.getItem('ogya_detected_location');
        return cached ? JSON.parse(cached) : null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const loc = await detectUserCityOrRegion();
      setDetectedLocation(loc);

      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('ogya_detected_location', JSON.stringify(loc));
        }
      } catch {
        // ignore
      }

      onFilterChange({ region: loc.matchedRegionValue });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to detect your current location.';
      setLocationError(message);
    } finally {
      setIsLocating(false);
    }
  };

  const handleClearDetectedLocation = () => {
    setDetectedLocation(null);
    setLocationError(null);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('ogya_detected_location');
      }
    } catch {
      // ignore
    }
    onFilterChange({ region: 'all' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-6 transition-colors duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} className="text-amber-600 dark:text-amber-500" />
          <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">
            Refine Filters
          </h3>
        </div>
        <button
          onClick={() => {
            setLocationError(null);
            onResetFilters();
          }}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Category selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => {
            const newCat = e.target.value as CategoryId | 'all';
            onFilterChange({ category: newCat, subcategory: 'all' });
          }}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="all" className="dark:bg-slate-900 dark:text-slate-100">All 17 Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id} className="dark:bg-slate-900 dark:text-slate-100">
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory selector (if category chosen) */}
      {currentCategory && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Subcategory
          </label>
          <select
            value={filters.subcategory}
            onChange={(e) => onFilterChange({ subcategory: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900 dark:text-slate-100">All {currentCategory.name}</option>
            {currentCategory.subcategories.map((sub) => (
              <option key={sub} value={sub} className="dark:bg-slate-900 dark:text-slate-100">
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Region selector with 'Use current location' button */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Region
          </label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-300/70 dark:border-amber-800/60 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Auto-detect your city or region using Geolocation"
          >
            {isLocating ? (
              <Loader2 size={12} className="animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <LocateFixed size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>{isLocating ? 'Detecting...' : 'Use current location'}</span>
          </button>
        </div>

        {/* Quick Location Pills: Accra, Kumasi, Tema, Takoradi, Tamale, Cape Coast */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {[
            { label: 'All Ghana', value: 'all' },
            { label: 'Accra', value: 'Accra' },
            { label: 'Kumasi', value: 'Kumasi' },
            { label: 'Tema', value: 'Tema' },
            { label: 'Takoradi', value: 'Takoradi' },
            { label: 'Tamale', value: 'Tamale' },
            { label: 'Cape Coast', value: 'Cape Coast' },
          ].map((pill) => {
            const isSelected =
              filters.region === pill.value ||
              (pill.value === 'all' && (filters.region === 'all' || filters.region === 'All Regions' || filters.region === 'All Ghana'));
            return (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  onFilterChange({ region: pill.value });
                  setLocationError(null);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF6600] text-white shadow-xs font-black'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        <select
          value={filters.region}
          onChange={(e) => {
            onFilterChange({ region: e.target.value });
            setLocationError(null);
          }}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="all" className="dark:bg-slate-900 dark:text-slate-100">All 16 Regions of Ghana</option>
          {detectedLocation && !REGIONS.includes(detectedLocation.matchedRegionValue) && (
            <option value={detectedLocation.matchedRegionValue} className="dark:bg-slate-900 dark:text-slate-100 font-bold">
              📍 {detectedLocation.displayName} (Current Location)
            </option>
          )}
          {REGIONS.map((r) => {
            const isDetected = detectedLocation && detectedLocation.matchedRegionValue === r;
            return (
              <option key={r} value={r} className="dark:bg-slate-900 dark:text-slate-100">
                {isDetected ? `📍 ${r} (Your Detected Region)` : r}
              </option>
            );
          })}
        </select>

        {/* Auto-detected location badge */}
        {detectedLocation && filters.region === detectedLocation.matchedRegionValue && (
          <div className="mt-2 flex items-center justify-between gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/70">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin size={12} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">
                Auto-detected: <strong>{detectedLocation.displayName}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={handleClearDetectedLocation}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/60 rounded px-1 transition-colors cursor-pointer text-xs font-bold shrink-0 ml-1"
              title="Clear detected location"
            >
              ✕
            </button>
          </div>
        )}

        {/* Location error banner */}
        {locationError && (
          <div className="mt-2 flex items-start justify-between gap-1.5 text-[11px] bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/70">
            <div className="flex items-start gap-1.5">
              <AlertCircle size={13} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span className="leading-tight">{locationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="text-rose-500 hover:text-rose-800 dark:hover:text-rose-200 font-bold ml-1 cursor-pointer shrink-0"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
          Price Range (GH₵)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min GH₵"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 tabular-nums focus:outline-none focus:border-amber-500"
          />
          <input
            type="number"
            placeholder="Max GH₵"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 tabular-nums focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Condition selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
          Condition
        </label>
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          {['all', 'Brand New', 'Like New / Mint', 'Refurbished', 'Fairly Used'].map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-slate-950 dark:hover:text-white">
              <input
                type="radio"
                name="conditionFilter"
                checked={filters.condition === c}
                onChange={() => onFilterChange({ condition: c })}
                className="text-amber-500 focus:ring-0"
              />
              <span>{c === 'all' ? 'All Conditions' : c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Seller Reputation & Badges Filter */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award size={14} className="text-amber-500" />
            Seller Reputation
          </span>
          {filters.badgeFilter && filters.badgeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onFilterChange({ badgeFilter: 'all' })}
              className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer lowercase"
            >
              Clear
            </button>
          )}
        </label>
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          {[
            { id: 'all', label: 'All Reputations' },
            { id: 'top-rated', label: 'Top Rated (★ 4.8+)' },
            { id: 'verified-pro', label: 'Verified Professional' },
            { id: 'fast-responder', label: 'Fast Responder (< 15m)' },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-950 dark:hover:text-white">
              <input
                type="radio"
                name="badgeFilter"
                checked={(filters.badgeFilter || 'all') === item.id}
                onChange={() => onFilterChange({ badgeFilter: item.id as any })}
                className="text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Verified Only Switch */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Verified Sellers Only
          </span>
          <input
            type="checkbox"
            checked={filters.onlyVerified}
            onChange={(e) => onFilterChange({ onlyVerified: e.target.checked })}
            className="w-4 h-4 text-amber-500 rounded focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Sort options */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="newest" className="dark:bg-slate-900 dark:text-slate-100">Newest First</option>
          <option value="top-rated" className="dark:bg-slate-900 dark:text-slate-100">⭐ Top Rated Sellers First</option>
          <option value="price-low" className="dark:bg-slate-900 dark:text-slate-100">Price: Low to High</option>
          <option value="price-high" className="dark:bg-slate-900 dark:text-slate-100">Price: High to Low</option>
          <option value="popular" className="dark:bg-slate-900 dark:text-slate-100">Most Popular / Viewed</option>
        </select>
      </div>

      {/* Results indicator */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing <strong className="text-slate-900 dark:text-white tabular-nums">{totalResults}</strong> listings
        </span>
      </div>
    </div>
  );
};
