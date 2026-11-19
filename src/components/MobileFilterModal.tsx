import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  RotateCcw,
  SlidersHorizontal,
  LocateFixed,
  Loader2,
  MapPin,
  AlertCircle,
  Award,
  CheckCircle2,
  Search,
  Check,
  ArrowDownUp,
  Tag,
  Banknote,
} from 'lucide-react';
import { CATEGORIES, REGIONS } from '../data/categories';
import { CategoryId, FilterState, Listing } from '../types/marketplace';
import { CategoryIcon } from './CategoryIcon';
import { detectUserCityOrRegion, DetectedLocation } from '../utils/geolocation';
import { filterAndSortListings, countActiveFilters } from '../utils/marketplaceHelpers';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  allListings: Listing[];
  onApplyFilters: (nextFilters: FilterState) => void;
  onResetFilters: () => void;
}

const DEFAULT_RESET_FILTERS: Omit<FilterState, 'searchQuery'> = {
  category: 'all',
  subcategory: 'all',
  region: 'all',
  minPrice: '',
  maxPrice: '',
  condition: 'all',
  onlyVerified: false,
  badgeFilter: 'all',
  sortBy: 'newest',
};

const QUICK_LOCATIONS = [
  { label: 'All Ghana', value: 'all' },
  { label: 'Accra', value: 'Accra' },
  { label: 'Kumasi', value: 'Kumasi' },
  { label: 'Tema', value: 'Tema' },
  { label: 'Takoradi', value: 'Takoradi' },
  { label: 'Tamale', value: 'Tamale' },
  { label: 'Cape Coast', value: 'Cape Coast' },
  { label: 'Amasaman', value: 'Amasaman' },
  { label: 'Madina', value: 'Madina' },
  { label: 'Kasoa', value: 'Kasoa' },
  { label: 'Legon', value: 'Legon' },
];

const PRICE_PRESETS = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under ₵500', min: '', max: '500' },
  { label: '₵500 – ₵2,500', min: '500', max: '2500' },
  { label: '₵2,500 – ₵10,000', min: '2500', max: '10000' },
  { label: '₵10,000+', min: '10000', max: '' },
];

export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  allListings,
  onApplyFilters,
  onResetFilters,
}) => {
  const [draft, setDraft] = useState<FilterState>(filters);
  const [categorySearch, setCategorySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
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

  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const categorySectionRef = useRef<HTMLElement>(null);
  const locationSectionRef = useRef<HTMLElement>(null);
  const priceSectionRef = useRef<HTMLElement>(null);
  const conditionSectionRef = useRef<HTMLElement>(null);
  const trustSectionRef = useRef<HTMLElement>(null);
  const sortSectionRef = useRef<HTMLElement>(null);

  // Sync draft state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
      setCategorySearch('');
      setRegionSearch('');
      setLocationError(null);
    }
  }, [isOpen, filters]);

  // Lock background scroll & support Escape key while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const liveMatchCount = useMemo(
    () => filterAndSortListings(allListings, draft).length,
    [allListings, draft]
  );

  const activeDraftCount = useMemo(() => countActiveFilters(draft), [draft]);

  const selectedCategoryObj = useMemo(
    () => CATEGORIES.find((c) => c.id === draft.category),
    [draft.category]
  );

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.subcategories.some((sub) => sub.toLowerCase().includes(q))
    );
  }, [categorySearch]);

  const filteredRegions = useMemo(() => {
    const q = regionSearch.trim().toLowerCase();
    if (!q) return REGIONS;
    return REGIONS.filter((r) => r.toLowerCase().includes(q));
  }, [regionSearch]);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      setDraft((prev) => ({ ...prev, region: loc.matchedRegionValue }));
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
    setDraft((prev) => ({ ...prev, region: 'all' }));
  };

  const handleResetDraft = () => {
    setLocationError(null);
    setCategorySearch('');
    setRegionSearch('');
    setDraft((prev) => ({
      ...DEFAULT_RESET_FILTERS,
      searchQuery: prev.searchQuery,
    }));
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleClearAndApply = () => {
    onResetFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Filters and Sort"
      className="min-[1025px]:hidden fixed inset-0 z-50 w-full h-[100dvh] bg-white dark:bg-slate-950 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
    >
      {/* 1. Sticky Top Bar */}
      <div className="shrink-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center shrink-0">
            <SlidersHorizontal size={18} className="text-[#FF6600]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
                Filter &amp; Sort
              </h2>
              {activeDraftCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#FF6600] text-white text-[11px] font-black tabular-nums">
                  {activeDraftCount}
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {liveMatchCount} matching listings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDraft}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors min-h-[40px]"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 2. Quick Section Jump Bar */}
      <div className="shrink-0 bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x">
        {[
          { label: 'Category', ref: categorySectionRef },
          { label: 'Location', ref: locationSectionRef },
          { label: 'Price (GH₵)', ref: priceSectionRef },
          { label: 'Condition', ref: conditionSectionRef },
          { label: 'Verified & Trust', ref: trustSectionRef },
          { label: 'Sort', ref: sortSectionRef },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => scrollToSection(tab.ref)}
            className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#FF6600] hover:text-[#FF6600] transition-colors cursor-pointer"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Scrollable Filter Body */}
      <div
        ref={scrollBodyRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-7 overscroll-contain"
      >
        {/* SECTION A: CATEGORY & SUBCATEGORY */}
        <section ref={categorySectionRef} className="space-y-3 scroll-mt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tag size={14} className="text-[#FF6600]" />
              <span>Category</span>
            </h3>
            {draft.category !== 'all' && (
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, category: 'all', subcategory: 'all' }))}
                className="text-xs font-bold text-[#FF6600] hover:underline cursor-pointer"
              >
                Show All 17
              </button>
            )}
          </div>

          {/* Search Categories */}
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 min-h-[42px]">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Find category (e.g. Phones, Food, Cars)..."
              className="w-full bg-transparent px-2.5 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            {categorySearch && (
              <button
                type="button"
                onClick={() => setCategorySearch('')}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Clear category search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Touch-Friendly Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {!categorySearch.trim() && (
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, category: 'all', subcategory: 'all' }))}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[48px] ${
                  draft.category === 'all'
                    ? 'bg-[#FF6600] text-white border-[#FF6600] shadow-sm font-black'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-amber-400 font-bold'
                }`}
              >
                <CategoryIcon categoryId="all" size={16} className="shrink-0" />
                <span className="text-xs leading-tight">All Categories</span>
              </button>
            )}

            {filteredCategories.map((cat) => {
              const isSelected = draft.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      category: cat.id as CategoryId,
                      subcategory: 'all',
                    }))
                  }
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[48px] ${
                    isSelected
                      ? 'bg-[#FF6600] text-white border-[#FF6600] shadow-sm font-black'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-amber-400 font-bold'
                  }`}
                >
                  <CategoryIcon
                    categoryId={cat.id}
                    size={16}
                    className={isSelected ? 'text-white shrink-0' : 'text-[#FF6600] shrink-0'}
                  />
                  <span className="text-xs leading-tight line-clamp-2">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
              No categories match "{categorySearch}".
            </p>
          )}

          {/* Subcategory Pills when a category is selected */}
          {selectedCategoryObj && (
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Subcategories in {selectedCategoryObj.name}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, subcategory: 'all' }))}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    draft.subcategory === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  All {selectedCategoryObj.name}
                </button>
                {selectedCategoryObj.subcategories.map((sub) => {
                  const isSubSelected = draft.subcategory === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, subcategory: sub }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSubSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* SECTION B: LOCATION & 16 REGIONS */}
        <section
          ref={locationSectionRef}
          className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3 scroll-mt-4"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin size={14} className="text-[#00875A]" />
              <span>Location &amp; Region</span>
            </h3>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300/70 dark:border-amber-800/60 transition-colors cursor-pointer disabled:opacity-50 min-h-[36px]"
            >
              {isLocating ? (
                <Loader2 size={13} className="animate-spin shrink-0" />
              ) : (
                <LocateFixed size={13} className="shrink-0" />
              )}
              <span>{isLocating ? 'Detecting...' : 'Use current location'}</span>
            </button>
          </div>

          {/* Detected Location Banner */}
          {detectedLocation && draft.region === detectedLocation.matchedRegionValue && (
            <div className="flex items-center justify-between gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="flex items-center gap-1.5 truncate">
                <MapPin size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">
                  Detected: <strong>{detectedLocation.displayName}</strong>
                </span>
              </span>
              <button
                type="button"
                onClick={handleClearDetectedLocation}
                className="font-bold text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 cursor-pointer"
                aria-label="Clear detected location"
              >
                ✕
              </button>
            </div>
          )}

          {locationError && (
            <div className="flex items-start justify-between gap-2 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800">
              <div className="flex items-start gap-1.5">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{locationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setLocationError(null)}
                className="font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Towns & Cities */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
              Popular Cities &amp; Neighborhoods
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_LOCATIONS.map((pill) => {
                const isSelected =
                  draft.region === pill.value ||
                  (pill.value === 'all' &&
                    (draft.region === 'all' ||
                      draft.region === 'All Regions' ||
                      draft.region === 'All Ghana'));
                return (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => {
                      setDraft((prev) => ({ ...prev, region: pill.value }));
                      setLocationError(null);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[38px] ${
                      isSelected
                        ? 'bg-[#FF6600] text-white border-[#FF6600] shadow-xs font-black'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & All 16 Regions */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              All 16 Regions of Ghana
            </p>
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 min-h-[42px]">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={regionSearch}
                onChange={(e) => setRegionSearch(e.target.value)}
                placeholder="Filter regions or towns (e.g. Ashanti, Takoradi)..."
                className="w-full bg-transparent px-2.5 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              {regionSearch && (
                <button
                  type="button"
                  onClick={() => setRegionSearch('')}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label="Clear region search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredRegions.map((reg) => {
                const isSelected = draft.region === reg;
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => {
                      setDraft((prev) => ({ ...prev, region: reg }));
                      setLocationError(null);
                    }}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                      isSelected
                        ? 'bg-[#00875A] text-white border-[#00875A] shadow-xs font-black'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60'
                    }`}
                  >
                    <span className="leading-snug">{reg}</span>
                    {isSelected && <Check size={15} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION C: PRICE RANGE */}
        <section
          ref={priceSectionRef}
          className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3 scroll-mt-4"
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Banknote size={15} className="text-emerald-600" />
            <span>Price Range (GH₵)</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Min Price (GH₵)
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={draft.minPrice}
                onChange={(e) => setDraft((prev) => ({ ...prev, minPrice: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Max Price (GH₵)
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Any"
                value={draft.maxPrice}
                onChange={(e) => setDraft((prev) => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((preset) => {
              const isSelected = draft.minPrice === preset.min && draft.maxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      minPrice: preset.min,
                      maxPrice: preset.max,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION D: CONDITION */}
        <section
          ref={conditionSectionRef}
          className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3 scroll-mt-4"
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Condition
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {['all', 'Brand New', 'Like New / Mint', 'Refurbished', 'Fairly Used'].map((c) => {
              const isSelected = draft.condition === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, condition: c }))}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer min-h-[44px] flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FF6600] text-white border-[#FF6600] font-black'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{c === 'all' ? 'All Conditions' : c}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION E: VERIFIED SELLERS & REPUTATION */}
        <section
          ref={trustSectionRef}
          className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3 scroll-mt-4"
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award size={15} className="text-amber-500" />
            <span>Seller Trust &amp; Reputation</span>
          </h3>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 cursor-pointer min-h-[52px]">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={17} className="text-[#00875A] shrink-0" />
              <span>Verified Sellers Only</span>
            </span>
            <input
              type="checkbox"
              checked={draft.onlyVerified}
              onChange={(e) => setDraft((prev) => ({ ...prev, onlyVerified: e.target.checked }))}
              className="w-5 h-5 accent-[#00875A] rounded cursor-pointer"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'all', label: 'All Reputations' },
              { id: 'top-rated', label: 'Top Rated (★ 4.8+)' },
              { id: 'verified-pro', label: 'Verified Professional' },
              { id: 'fast-responder', label: 'Fast Responder (< 15m)' },
            ].map((item) => {
              const isSelected = (draft.badgeFilter || 'all') === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, badgeFilter: item.id as FilterState['badgeFilter'] }))
                  }
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer min-h-[44px] flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white font-black'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION F: SORT BY */}
        <section
          ref={sortSectionRef}
          className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3 scroll-mt-4 pb-4"
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <ArrowDownUp size={14} className="text-slate-500" />
            <span>Sort Results By</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'newest', label: 'Newest First' },
              { id: 'top-rated', label: '⭐ Top Rated Sellers First' },
              { id: 'price-low', label: 'Price: Low to High' },
              { id: 'price-high', label: 'Price: High to Low' },
              { id: 'popular', label: 'Most Popular / Viewed' },
            ].map((opt) => {
              const isSelected = draft.sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, sortBy: opt.id as FilterState['sortBy'] }))
                  }
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer min-h-[44px] flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FF6600] text-white border-[#FF6600] font-black'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* 4. Sticky Bottom Apply Bar */}
      <div className="shrink-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={handleClearAndApply}
          className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-black text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[48px] shrink-0"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 py-3 px-4 rounded-xl bg-[#00875A] hover:bg-[#00704a] active:bg-[#005a3c] text-white font-black text-sm shadow-md transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
        >
          <span>Show {liveMatchCount} {liveMatchCount === 1 ? 'Listing' : 'Listings'}</span>
        </button>
      </div>
    </div>
  );
};
