import React, { useState } from 'react';
import { Sparkles, MessageCircle, MapPin, Tag, PlusCircle, Search, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { WantedItem } from '../types/marketplace';

interface BuyersWantFeedProps {
  wantedItems: WantedItem[];
  onOpenIWantThis: () => void;
}

export const BuyersWantFeed: React.FC<BuyersWantFeedProps> = ({
  wantedItems,
  onOpenIWantThis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const filteredItems = wantedItems.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity =
      selectedCity === 'all' ||
      item.location.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesSearch && matchesCity;
  });

  const getWhatsAppLink = (item: WantedItem) => {
    const cleanNumber = item.whatsapp.replace(/[^0-9]/g, '');
    const message = `Hello! I saw your request on OGYA FIRE that you want "${item.item}" with a budget of GH₵ ${item.budget.toLocaleString()}. I have this available. Are you ready to deal?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Big Orange Action Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={14} className="text-orange-500 animate-pulse" />
              <span>Direct Buyer Requests</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Buyers Want <span className="text-orange-600 dark:text-orange-500">— Live Buyer Demands</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-medium">
              Buyers across Ghana post what they are searching for with cash ready. If you are a seller and have the product, click <strong className="text-emerald-600 dark:text-emerald-400">"I Have This"</strong> to contact them immediately on WhatsApp!
            </p>
          </div>

          {/* Big Orange Button */}
          <div className="shrink-0">
            <button
              onClick={onOpenIWantThis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle size={20} className="shrink-0" />
              <span>I WANT THIS - Post What You Want</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Bar for Sellers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter buyer requests (e.g. iPhone, Toyota, PS5, Apartment)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['all', 'Accra', 'Kumasi', 'Tema', 'Takoradi'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCity === city
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {city === 'all' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Wanted Items */}
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-8 sm:p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center mx-auto mb-4 text-orange-600 dark:text-orange-400">
              <Tag size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              No matching buyer requests found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Be the first to post what you are looking for in Ghana! Click below to tell sellers what you want.
            </p>
            <button
              onClick={onOpenIWantThis}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>Post Your Item Request</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/70 hover:border-orange-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Status & Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-900/40">
                      <span>WANTED</span>
                    </span>

                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      <span>{item.createdAtFormatted || 'Recently'}</span>
                    </span>
                  </div>

                  {/* Title / What Buyer Wants */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {item.item}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  {/* Optional Notes */}
                  {item.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 line-clamp-2 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Price & "I Have This" Action Button */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Buyer's Budget
                    </span>
                    <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      GH₵ {item.budget.toLocaleString()}
                    </span>
                  </div>

                  {/* "I Have This" WhatsApp Trigger */}
                  <a
                    href={getWhatsAppLink(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider shadow-sm shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>I Have This</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
