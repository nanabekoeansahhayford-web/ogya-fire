import React from 'react';
import { X, Trash2, ExternalLink, Bookmark, ShoppingBag, Bell, BellRing } from 'lucide-react';
import { Listing } from '../types/marketplace';
import { formatPrice } from '../utils/storage';

interface SavedAdsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedListings: Listing[];
  onRemoveSaved: (id: string) => void;
  onOpenDetails: (listing: Listing) => void;
  priceAlerts?: string[];
  onTogglePriceAlert?: (id: string) => void;
}

export const SavedAdsDrawer: React.FC<SavedAdsDrawerProps> = ({
  isOpen,
  onClose,
  savedListings,
  onRemoveSaved,
  onOpenDetails,
  priceAlerts = [],
  onTogglePriceAlert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <h3 className="text-base font-black text-slate-950 dark:text-white">
              Saved Ads ({savedListings.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedListings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <ShoppingBag size={48} className="mb-3 text-slate-300 dark:text-slate-600 stroke-1" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">No Saved Ads Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Click the heart icon on any ad across the 17 categories to bookmark it for quick access.
              </p>
            </div>
          ) : (
            savedListings.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-colors group"
              >
                {item.images && item.images[0] && (
                  <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {(item.status === 'sold' || item.isSold) && (
                      <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-black text-[9px] uppercase px-1 py-0.2 rounded">
                          SOLD
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onClose();
                    onOpenDetails(item);
                  }}
                >
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {item.categoryName}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate transition-colors">
                    {item.title}
                  </h5>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs font-extrabold tabular-nums ${item.status === 'sold' || item.isSold ? 'line-through text-slate-400' : 'text-slate-950 dark:text-white'}`}>
                      {formatPrice(item.price, item.currency)}
                    </span>
                    {(item.status === 'sold' || item.isSold) && (
                      <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 rounded">
                        SOLD
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {onTogglePriceAlert && (
                    <button
                      onClick={() => onTogglePriceAlert(item.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        priceAlerts.includes(item.id)
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60'
                          : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200/50 dark:hover:bg-slate-700'
                      }`}
                      title={priceAlerts.includes(item.id) ? 'Price drop alert active (Click to remove)' : 'Notify me of price drops'}
                    >
                      {priceAlerts.includes(item.id) ? <BellRing size={15} /> : <Bell size={15} />}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDetails(item);
                    }}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="View details"
                  >
                    <ExternalLink size={15} />
                  </button>
                  <button
                    onClick={() => onRemoveSaved(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {savedListings.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>All bookmarks saved on this device</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-lg cursor-pointer transition-colors border border-transparent dark:border-slate-700"
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
