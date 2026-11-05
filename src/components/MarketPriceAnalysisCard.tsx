import React, { useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Scale,
  ShieldCheck,
  RotateCw,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Listing } from '../types/marketplace';
import { MarketPriceEstimate } from '../types/marketPrice';
import { formatPrice } from '../utils/storage';

interface MarketPriceAnalysisCardProps {
  listing: Listing;
  estimate: MarketPriceEstimate | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onSelectComparable?: (listingId: string) => void;
  currency?: string;
}

export const MarketPriceAnalysisCard: React.FC<MarketPriceAnalysisCardProps> = ({
  listing,
  estimate,
  isLoading = false,
  onRefresh,
  onSelectComparable,
  currency = 'GH₵',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!estimate && !isLoading) return null;

  const currentPrice = listing.price;
  const medianPrice = estimate ? estimate.estimatedPriceMedian : currentPrice;
  const minPrice = estimate ? estimate.estimatedPriceMin : Math.round(currentPrice * 0.9);
  const maxPrice = estimate ? estimate.estimatedPriceMax : Math.round(currentPrice * 1.1);

  // Compute percentage position along a visual spectrum bar (clamp between 5% and 95%)
  const spectrumMin = Math.round(minPrice * 0.85);
  const spectrumMax = Math.round(maxPrice * 1.15);
  const totalRange = spectrumMax - spectrumMin || 1;
  const pinPercent = Math.min(95, Math.max(5, Math.round(((currentPrice - spectrumMin) / totalRange) * 100)));

  const isGreat = estimate?.dealRating === 'great_deal';
  const isGood = estimate?.dealRating === 'good_deal';
  const isFair = estimate?.dealRating === 'fair_price';
  const isAbove = estimate?.dealRating === 'above_market' || estimate?.dealRating === 'overpriced';

  let ratingTheme = {
    border: 'border-slate-200 dark:border-slate-800',
    headerBg: 'bg-slate-50 dark:bg-slate-900',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    accentColor: 'text-slate-700 dark:text-slate-300',
  };

  if (isGreat) {
    ratingTheme = {
      border: 'border-emerald-300 dark:border-emerald-800/80',
      headerBg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    };
  } else if (isGood) {
    ratingTheme = {
      border: 'border-teal-300 dark:border-teal-800/80',
      headerBg: 'bg-teal-50/70 dark:bg-teal-950/40',
      badgeBg: 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200',
      accentColor: 'text-teal-600 dark:text-teal-400',
    };
  } else if (isFair) {
    ratingTheme = {
      border: 'border-sky-300 dark:border-sky-800/80',
      headerBg: 'bg-sky-50/70 dark:bg-sky-950/40',
      badgeBg: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200',
      accentColor: 'text-sky-600 dark:text-sky-400',
    };
  } else if (isAbove) {
    ratingTheme = {
      border: 'border-amber-300 dark:border-amber-800/80',
      headerBg: 'bg-amber-50/70 dark:bg-amber-950/40',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
      accentColor: 'text-amber-600 dark:text-amber-400',
    };
  }

  return (
    <div
      id="ai-market-price-card"
      className={`rounded-2xl border ${ratingTheme.border} bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all duration-200`}
    >
      {/* Card Header */}
      <div
        className={`px-4 sm:px-5 py-3.5 ${ratingTheme.headerBg} border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 cursor-pointer select-none`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white truncate">
                AI Estimated Market Price
              </h4>
              {estimate && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${ratingTheme.badgeBg}`}>
                  {estimate.dealLabel}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Powered by Gemini 3.8 AI & category market benchmarking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onRefresh && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onRefresh}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh AI Market Estimate"
              aria-label="Refresh estimate"
            >
              <RotateCw size={14} className={isLoading ? 'animate-spin text-amber-500' : ''} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {isLoading && !estimate ? (
            <div className="py-8 text-center space-y-2">
              <Sparkles size={24} className="text-amber-500 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Evaluating category listings and current market rates...
              </p>
            </div>
          ) : estimate ? (
            <>
              {/* Summary Hero Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Asking Price
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">
                    {formatPrice(currentPrice, currency)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {listing.isNegotiable ? 'Negotiable' : 'Fixed Price'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Fair Market Value
                  </span>
                  <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatPrice(medianPrice, currency)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    AI Expected Median
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Market Range
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 tabular-nums block truncate">
                    {formatPrice(minPrice, currency)} – {formatPrice(maxPrice, currency)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Normal Spread
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Deal Assessment
                  </span>
                  <div className="flex items-center gap-1 font-extrabold text-xs sm:text-sm">
                    {isGreat || isGood ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <TrendingDown size={14} />
                        <span>-{Math.abs(estimate.percentageDiff)}%</span>
                      </span>
                    ) : isFair ? (
                      <span className="text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                        <Scale size={13} />
                        <span>Fair Rate</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <TrendingUp size={14} />
                        <span>+{Math.abs(estimate.percentageDiff)}%</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                    {isGreat || isGood
                      ? `Saves ~${formatPrice(Math.abs(estimate.priceDifference), currency)}`
                      : isFair
                      ? 'Within +/- 5% range'
                      : 'Higher than average'}
                  </span>
                </div>
              </div>

              {/* Visual Deal Spectrum Bar */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <span>🔥 Great Deal</span>
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Fair Market Range ({formatPrice(minPrice, currency)} - {formatPrice(maxPrice, currency)})
                  </span>
                  <span className="text-amber-700 dark:text-amber-400">
                    Above Market ⚠️
                  </span>
                </div>

                {/* Progress Gradient Track */}
                <div className="relative h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-sky-400 to-amber-500 opacity-80" />
                  {/* Market Range Window Shade */}
                  <div
                    className="absolute top-0 bottom-0 bg-white/40 dark:bg-black/25 border-x-2 border-white/80"
                    style={{
                      left: '25%',
                      width: '50%',
                    }}
                  />
                </div>

                {/* Pin Needle Pointer */}
                <div className="relative w-full h-5">
                  <div
                    className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                    style={{ left: `${pinPercent}%` }}
                  >
                    <span className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-900 dark:border-b-white" />
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs whitespace-nowrap tabular-nums">
                      This Ad: {formatPrice(currentPrice, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verdict & Valuation Drivers */}
              <div className="space-y-2">
                <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 rounded-xl border border-amber-500/20 text-slate-800 dark:text-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                    AI Market Verdict:
                  </span>
                  <p className="text-xs leading-relaxed font-medium">
                    {estimate.verdict}
                  </p>
                </div>

                {estimate.factors && estimate.factors.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Valuation Factors & Drivers:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {estimate.factors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Buyer Negotiation Tip */}
              {estimate.negotiationAdvice && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white font-bold block mb-0.5">
                      Smart Buyer Tip:
                    </strong>
                    {estimate.negotiationAdvice}
                  </div>
                </div>
              )}

              {/* Similar Items in Category Comparables */}
              {estimate.comparables && estimate.comparables.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers size={12} className="text-amber-500" />
                      <span>Similar Listings in {listing.subcategory} ({estimate.comparables.length} compared)</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Category Median: {formatPrice(estimate.categoryBenchmark.categoryMedianPrice, currency)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {estimate.comparables.slice(0, 4).map((comp) => (
                      <div
                        key={comp.id}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {comp.thumbnail ? (
                            <img
                              src={comp.thumbnail}
                              alt={comp.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              <Tag size={14} className="text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white truncate block">
                              {comp.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                              {comp.condition} · {comp.location.split(',')[0]}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-slate-900 dark:text-white block tabular-nums">
                            {formatPrice(comp.price, comp.currency)}
                          </span>
                          {onSelectComparable && (
                            <button
                              type="button"
                              onClick={() => onSelectComparable(comp.id)}
                              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 ml-auto cursor-pointer"
                            >
                              <span>View</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>AI Valuation Confidence: <strong className="text-slate-700 dark:text-slate-300 font-bold">{estimate.confidence}%</strong></span>
                </span>
                <span>Updated at {estimate.analyzedAt}</span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
