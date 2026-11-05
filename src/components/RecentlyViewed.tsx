import React from 'react';
import { Clock, Trash2, Heart, MapPin, Eye, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';
import { Listing } from '../types/marketplace';
import { formatPrice } from '../utils/storage';

interface RecentlyViewedProps {
  items: Listing[];
  onOpenDetails: (listing: Listing) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  savedIds: string[];
  onClear: () => void;
  variant?: 'feed' | 'sidebar';
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  items,
  onOpenDetails,
  onToggleSave,
  savedIds,
  onClear,
  variant = 'feed',
}) => {
  if (items.length === 0) {
    if (variant === 'sidebar') return null;

    // Friendly hint when nothing viewed yet
    return (
      <section id="recently-viewed" className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-2">
            <Eye size={20} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            Recently Viewed Tracker
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Click on any listing across the 17 categories to track your last 5 viewed items here for fast comparisons during your session.
          </p>
        </div>
      </section>
    );
  }

  // Sidebar compact variant
  if (variant === 'sidebar') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 transition-colors duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock size={15} className="text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">
              Recent ({items.length}/5)
            </h4>
          </div>
          <button
            onClick={onClear}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Clear recently viewed history"
          >
            Clear
          </button>
        </div>

        <div className="space-y-2">
          {items.map((listing) => (
            <div
              key={listing.id}
              onClick={() => onOpenDetails(listing)}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all cursor-pointer group"
            >
              {listing.images && listing.images[0] ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                  🔥
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block truncate">
                  {listing.categoryName}
                </span>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate transition-colors">
                  {listing.title}
                </h5>
                <div className="text-xs font-extrabold text-slate-950 dark:text-white tabular-nums">
                  {formatPrice(listing.price, listing.currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main feed section variant (full horizontal/grid display below the main feed)
  return (
    <section id="recently-viewed" className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>Recently Viewed Items</span>
              <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-900/50 px-2 py-0.5 rounded-full tabular-nums">
                {items.length} of 5
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracked for this browsing session. Click any card to re-open details, contact the seller, or share.
          </p>
        </div>

        <button
          onClick={onClear}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-800"
          title="Clear session history"
        >
          <Trash2 size={13} />
          <span>Clear History</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((listing) => {
          const isSaved = savedIds.includes(listing.id);
          return (
            <div
              key={listing.id}
              onClick={() => onOpenDetails(listing)}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                {listing.images && listing.images[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    🔥
                  </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {(listing.status === 'sold' || listing.isSold) ? (
                    <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-md shadow-xs uppercase">
                      SOLD
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                      {listing.categoryName}
                    </span>
                  )}
                </div>

                {/* Save Heart Button */}
                <button
                  type="button"
                  onClick={(e) => onToggleSave(listing.id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-900/60 text-white hover:bg-slate-900/90'
                  }`}
                  title={isSaved ? 'Remove from saved' : 'Save ad'}
                  aria-label="Save listing"
                >
                  <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Card Content */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-amber-700 dark:text-amber-400 truncate">
                      {listing.subcategory}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {listing.condition}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2 transition-colors">
                    {listing.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-sm font-black tabular-nums ${listing.status === 'sold' || listing.isSold ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-950 dark:text-white'}`}>
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                    {(listing.status === 'sold' || listing.isSold) && (
                      <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 rounded">
                        SOLD
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <MapPin size={11} className="shrink-0" />
                    <span className="truncate max-w-[90px]">{listing.location.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
