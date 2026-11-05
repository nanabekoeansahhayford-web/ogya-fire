import React from 'react';
import { Sparkles, TrendingDown, TrendingUp, Scale, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { MarketPriceEstimate } from '../types/marketPrice';
import { formatPrice } from '../utils/storage';

interface EstimatedMarketPriceBadgeProps {
  estimate: MarketPriceEstimate | null;
  isLoading?: boolean;
  onOpenAnalysis?: () => void;
  currency?: string;
  className?: string;
}

export const EstimatedMarketPriceBadge: React.FC<EstimatedMarketPriceBadgeProps> = ({
  estimate,
  isLoading = false,
  onOpenAnalysis,
  currency = 'GH₵',
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 animate-pulse ${className}`}>
        <Sparkles size={14} className="text-amber-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Calculating AI Market Price...
        </span>
      </div>
    );
  }

  if (!estimate) return null;

  const isGreat = estimate.dealRating === 'great_deal';
  const isGood = estimate.dealRating === 'good_deal';
  const isFair = estimate.dealRating === 'fair_price';
  const isAbove = estimate.dealRating === 'above_market';
  const isOver = estimate.dealRating === 'overpriced';

  // Badge visual theme
  let badgeClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
  let icon = <Scale size={13} className="text-slate-500" />;
  let pillText = estimate.dealLabel;

  if (isGreat) {
    badgeClasses =
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/40';
    icon = <TrendingDown size={14} className="text-emerald-600 dark:text-emerald-400" />;
  } else if (isGood) {
    badgeClasses =
      'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800/70 hover:bg-teal-100 dark:hover:bg-teal-900/40';
    icon = <TrendingDown size={14} className="text-teal-600 dark:text-teal-400" />;
  } else if (isFair) {
    badgeClasses =
      'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800/70 hover:bg-sky-100 dark:hover:bg-sky-900/40';
    icon = <Scale size={14} className="text-sky-600 dark:text-sky-400" />;
  } else if (isAbove) {
    badgeClasses =
      'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800/70 hover:bg-amber-100 dark:hover:bg-amber-900/40';
    icon = <TrendingUp size={14} className="text-amber-600 dark:text-amber-400" />;
  } else if (isOver) {
    badgeClasses =
      'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800/70 hover:bg-rose-100 dark:hover:bg-rose-900/40';
    icon = <AlertCircle size={14} className="text-rose-600 dark:text-rose-400" />;
  }

  const savingsAmount = Math.abs(estimate.priceDifference);
  const diffPercent = Math.abs(estimate.percentageDiff);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={onOpenAnalysis}
        className={`group inline-flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer select-none ${badgeClasses}`}
        title="Click to view AI Estimated Market Price Breakdown & Category Comparison"
      >
        <div className="flex items-center gap-1.5">
          <span className="shrink-0">{icon}</span>
          <span className="font-extrabold tracking-tight">{pillText}</span>
          <span className="hidden sm:inline-block opacity-40">|</span>
          <span className="font-medium text-[11px] opacity-90 truncate">
            {isGreat || isGood ? (
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                Save ~{formatPrice(savingsAmount, currency)} ({diffPercent}%)
              </span>
            ) : isFair ? (
              <span>Fair Market: {formatPrice(estimate.estimatedPriceMedian, currency)}</span>
            ) : (
              <span>+{diffPercent}% vs category average</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform">
          <span className="hidden md:inline">AI Analysis</span>
          <ChevronRight size={13} />
        </div>
      </button>

      {/* Micro subtitle showing estimated price range */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium">
        <Sparkles size={11} className="text-amber-500 shrink-0" />
        <span>
          AI Estimated Market Range:{' '}
          <strong className="text-slate-700 dark:text-slate-300 font-bold tabular-nums">
            {formatPrice(estimate.estimatedPriceMin, currency)} – {formatPrice(estimate.estimatedPriceMax, currency)}
          </strong>
        </span>
      </div>
    </div>
  );
};
