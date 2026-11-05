import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  Zap,
  Tag,
  RefreshCw,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CategoryId, ItemCondition, Listing } from '../types/marketplace';
import { SmartPriceAdvice, SmartPriceRequest } from '../types/marketPrice';
import { fetchSmartPriceAdvice, calculateLocalSmartPrice } from '../utils/marketPrice';

interface SmartPriceAdvisorProps {
  title: string;
  categoryId: CategoryId;
  categoryName: string;
  subcategory: string;
  condition: ItemCondition;
  region: string;
  location: string;
  description?: string;
  currentPrice: string;
  isNegotiable: boolean;
  onApplyPrice: (price: number) => void;
  onSetNegotiable?: (negotiable: boolean) => void;
  allListings: Listing[];
}

export const SmartPriceAdvisor: React.FC<SmartPriceAdvisorProps> = ({
  title,
  categoryId,
  categoryName,
  subcategory,
  condition,
  region,
  location,
  description,
  currentPrice,
  isNegotiable,
  onApplyPrice,
  onSetNegotiable,
  allListings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<SmartPriceAdvice | null>(null);
  const [appliedPriceType, setAppliedPriceType] = useState<'recommended' | 'quick' | 'premium' | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  const parsedCurrentPrice = parseFloat(currentPrice) || 0;

  const handleFetchAdvice = async () => {
    if (!title.trim()) {
      setInputError('Please enter a Product Title above first (e.g. iPhone 13 128GB or 2018 Toyota Corolla) so AI can evaluate market trends.');
      setIsOpen(true);
      return;
    }

    setInputError(null);
    setIsLoading(true);
    setIsOpen(true);

    const request: SmartPriceRequest = {
      title: title.trim(),
      categoryId,
      categoryName,
      subcategory,
      condition,
      region,
      location: location.trim() || 'Accra',
      description,
      currentInputPrice: parsedCurrentPrice,
    };

    try {
      const result = await fetchSmartPriceAdvice(request, allListings);
      setAdvice(result);
    } catch (err) {
      console.warn('Smart price advice fetch failed, using local model:', err);
      const fallback = calculateLocalSmartPrice(request, allListings);
      setAdvice(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (amount: number, type: 'recommended' | 'quick' | 'premium') => {
    onApplyPrice(amount);
    setAppliedPriceType(type);
    setShowAppliedToast(true);
    setTimeout(() => {
      setShowAppliedToast(false);
    }, 2800);
  };

  // Determine current price status against advice
  const getPriceComparisonStatus = () => {
    if (!advice || parsedCurrentPrice <= 0) return null;

    if (parsedCurrentPrice < advice.quickSalePrice * 0.95) {
      return {
        label: '⚡ Ultra-Fast Sale Price',
        description: `Your price (GH₵ ${parsedCurrentPrice.toLocaleString()}) is below the quick-sale baseline. Expect immediate WhatsApp offers!`,
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
      };
    }
    if (parsedCurrentPrice <= advice.premiumPrice * 1.05) {
      return {
        label: '🎯 Optimal Market Range',
        description: `Your price (GH₵ ${parsedCurrentPrice.toLocaleString()}) is inside the recommended Ghanaian market window for this item.`,
        color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
      };
    }
    return {
      label: '🏷️ Premium Asking Price',
      description: `Your price (GH₵ ${parsedCurrentPrice.toLocaleString()}) is above the typical category threshold. Providing extra accessories or negotiable terms is recommended.`,
      color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800',
    };
  };

  const priceStatus = getPriceComparisonStatus();

  return (
    <div className="rounded-2xl border border-amber-200/90 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-amber-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-amber-950/20 overflow-hidden shadow-xs transition-all">
      {/* Banner / Header Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-2xs shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                <span>AI Smart Price Advisor</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Ghana Market Intelligence
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Suggests competitive Ghanaian Cedi selling prices based on current demand, depreciation & comparable items
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOpen ? (
            <button
              type="button"
              onClick={handleFetchAdvice}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-slate-950" />
              <span>Suggest Smart Price</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleFetchAdvice}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                title="Re-analyze with current title or condition"
              >
                <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
                <span>Re-Analyze</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Collapse advisor"
              >
                <ChevronUp size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="border-t border-amber-200/80 dark:border-slate-800/80 p-4 sm:p-5 bg-white/70 dark:bg-slate-950/60 space-y-4">
          {/* Missing Title Notice */}
          {inputError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{inputError}</span>
            </div>
          )}

          {/* Loading State with Shimmer Animation */}
          {isLoading && (
            <div className="py-8 px-4 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-400/40 animate-pulse">
                <Sparkles size={24} className="animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Consulting Ghana Market Intelligence...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Evaluating comparable listings in <strong>{subcategory || categoryName}</strong>, condition factor ({condition}), and current buyer demand in {region.split('(')[0].trim()}.
                </p>
              </div>
              <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Advice Results */}
          {!isLoading && advice && (
            <div className="space-y-4">
              {/* Toast confirmation after applying price */}
              {showAppliedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Price updated in your listing form!</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded font-mono">
                    GH₵ {parsedCurrentPrice.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Status Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                    <Flame size={13} className="text-orange-600 dark:text-orange-400 fill-current" />
                    <span>{advice.marketTrend}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                    <Clock size={12} />
                    <span>{advice.estimatedDaysToSell}</span>
                  </span>
                </div>

                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>{advice.isAiPowered ? 'Powered by Gemini 3.8 Flash' : 'Calibrated from Ghanaian Market Data'}</span>
                  <span>·</span>
                  <span>Updated {advice.analyzedAt}</span>
                </span>
              </div>

              {/* Hero Recommended Optimal Price Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                    Optimal Selling Price (Recommended)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tabular-nums tracking-tight">
                      GH₵ {advice.recommendedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      GHS
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-md leading-relaxed">
                    {advice.summary}
                  </p>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleApply(advice.recommendedPrice, 'recommended')}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                      parsedCurrentPrice === advice.recommendedPrice
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 active:scale-98'
                    }`}
                  >
                    {parsedCurrentPrice === advice.recommendedPrice ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Optimal (GH₵ {advice.recommendedPrice.toLocaleString()})</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3 Strategy Tiers: Quick Cash, Optimal, Premium */}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Pricing Strategies & Speed Options
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Tier 1: Quick Sale */}
                  <div
                    onClick={() => handleApply(advice.quickSalePrice, 'quick')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      parsedCurrentPrice === advice.quickSalePrice
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:border-amber-400 dark:hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Zap size={11} className="fill-current" />
                        <span>Quick Cash</span>
                      </span>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                        &lt;48 Hours
                      </span>
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                      GH₵ {advice.quickSalePrice.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      Priced for rapid liquidation
                    </p>
                    <button
                      type="button"
                      className="mt-2 w-full py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-colors"
                    >
                      {parsedCurrentPrice === advice.quickSalePrice ? 'Selected ✓' : 'Use Quick Price'}
                    </button>
                  </div>

                  {/* Tier 2: Optimal Sweet Spot */}
                  <div
                    onClick={() => handleApply(advice.recommendedPrice, 'recommended')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      parsedCurrentPrice === advice.recommendedPrice
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 ring-1 ring-amber-500'
                        : 'border-amber-300/80 dark:border-amber-800/80 bg-amber-50/40 dark:bg-slate-900/80 hover:border-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Optimal Sweet Spot</span>
                      </span>
                      <span className="text-[9px] font-bold bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded">
                        Best Return
                      </span>
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                      GH₵ {advice.recommendedPrice.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      Balances margin and rapid inquiry
                    </p>
                    <button
                      type="button"
                      className="mt-2 w-full py-1 rounded-lg bg-amber-500 text-slate-950 border border-amber-500 text-[10px] font-bold transition-colors"
                    >
                      {parsedCurrentPrice === advice.recommendedPrice ? 'Selected ✓' : 'Use Optimal'}
                    </button>
                  </div>

                  {/* Tier 3: Premium Value */}
                  <div
                    onClick={() => handleApply(advice.premiumPrice, 'premium')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      parsedCurrentPrice === advice.premiumPrice
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/40 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:border-amber-400 dark:hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                        <Tag size={11} />
                        <span>Premium / Patient</span>
                      </span>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                        Top Margin
                      </span>
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                      GH₵ {advice.premiumPrice.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      For mint condition or extras
                    </p>
                    <button
                      type="button"
                      className="mt-2 w-full py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-colors"
                    >
                      {parsedCurrentPrice === advice.premiumPrice ? 'Selected ✓' : 'Use Premium'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Price Match Health Check (if seller entered custom price) */}
              {priceStatus && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${priceStatus.color}`}>
                  <Sliders size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-xs">{priceStatus.label}</span>
                    <span className="leading-relaxed opacity-95">{priceStatus.description}</span>
                  </div>
                </div>
              )}

              {/* Market Rationale Factors */}
              {advice.reasons && advice.reasons.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    Ghana Market Valuation Drivers
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {advice.reasons.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">✓</span>
                        <span className="leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Seller Pro-Tip */}
              {advice.proTip && (
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      <strong className="font-extrabold">Seller Tip for Ghana: </strong>
                      <span>{advice.proTip}</span>
                    </div>
                  </div>
                  {advice.suggestedNegotiable && !isNegotiable && onSetNegotiable && (
                    <button
                      type="button"
                      onClick={() => onSetNegotiable(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 transition-colors shadow-2xs cursor-pointer"
                    >
                      Enable "Negotiable"
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
