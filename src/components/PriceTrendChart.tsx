import React, { useEffect, useState, useId } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  RotateCw,
  Clock,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { Listing, PriceHistoryPoint } from '../types/marketplace';
import { fetchPriceHistory, computePriceTrendAnalytics, PriceTrendAnalytics } from '../utils/priceHistory';
import { formatPrice } from '../utils/storage';

interface PriceTrendChartProps {
  listing: Listing;
  className?: string;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ listing, className = '' }) => {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<PriceTrendAnalytics | null>(null);
  const gradientId = useId();

  const loadData = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      if (forceRefresh) {
        try {
          localStorage.removeItem(`ogya_price_history_${listing.id}`);
        } catch {
          // ignore
        }
      }
      const points = await fetchPriceHistory(listing);
      setHistory(points);
      setAnalytics(computePriceTrendAnalytics(points));
    } catch (e) {
      console.error('Failed to load price history', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [listing.id, listing.price]);

  // If price is zero or not an item with price history (e.g. standard CV or unpaid internship)
  if (!listing.price || listing.price <= 0) {
    return null;
  }

  // Format short currency for Y-Axis labels (e.g. "35k", "1.8M")
  const formatAxisPrice = (val: number): string => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 0)}k`;
    }
    return String(val);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500 font-bold">
              {analytics?.isDrop ? (
                <TrendingDown size={17} className="text-emerald-500" />
              ) : analytics?.isIncrease ? (
                <TrendingUp size={17} className="text-amber-500" />
              ) : (
                <Minus size={17} className="text-slate-400" />
              )}
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950 dark:text-white">
              Price Trend & History
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Historical price tracker across verified listing adjustments
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {analytics && analytics.isDrop && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
              <ArrowDownRight size={13} />
              <span>{Math.abs(analytics.percentageChange).toFixed(1)}% Drop</span>
            </span>
          )}

          {analytics && analytics.isIncrease && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={13} />
              <span>+{analytics.percentageChange.toFixed(1)}% Trend</span>
            </span>
          )}

          {analytics && analytics.isStable && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
              <span>Stable Price</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
            title="Refresh historical price data"
            aria-label="Refresh price history"
          >
            <RotateCw size={13} className={isLoading ? 'animate-spin text-amber-500' : ''} />
          </button>
        </div>
      </div>

      {/* Loading state skeleton */}
      {isLoading ? (
        <div className="h-44 w-full flex flex-col justify-center items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60 p-4 animate-pulse">
          <Clock size={20} className="text-amber-500/70 animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Fetching price history points...
          </span>
        </div>
      ) : history.length > 1 ? (
        <>
          {/* Recharts Line Chart Container */}
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height={176}>
              <LineChart
                data={history}
                margin={{ top: 8, right: 12, left: -14, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#cbd5e1"
                  strokeOpacity={0.4}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.3 }}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  dy={4}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  tickFormatter={formatAxisPrice}
                  domain={['dataMin - (dataMax - dataMin) * 0.15', 'dataMax + (dataMax - dataMin) * 0.15']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as PriceHistoryPoint;
                      return (
                        <div className="bg-slate-900/95 dark:bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl text-xs backdrop-blur-sm z-50">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                            {data.date} {data.label ? `• ${data.label}` : ''}
                          </p>
                          <p className="text-sm font-black text-amber-400 tabular-nums mt-0.5">
                            {formatPrice(data.price, listing.currency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: '#f59e0b',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#d97706',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
              <span className="block text-[10px] font-bold uppercase text-slate-400">First Listed</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {analytics ? formatPrice(analytics.initialPrice, listing.currency) : '—'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
              <span className="block text-[10px] font-bold uppercase text-slate-400">Lowest Recorded</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {analytics ? formatPrice(analytics.lowestPrice, listing.currency) : '—'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
              <span className="block text-[10px] font-bold uppercase text-slate-400">Current Asking</span>
              <span className="text-xs font-black text-slate-950 dark:text-white tabular-nums">
                {formatPrice(listing.price, listing.currency)}
              </span>
            </div>
          </div>

          {/* Savings Highlight if price dropped */}
          {analytics && analytics.isDrop && (
            <div className="mt-2.5 flex items-center justify-between text-[11px] bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Save <strong>{formatPrice(Math.abs(analytics.priceDifference), listing.currency)}</strong> compared to original price!
                </span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                Verified Deal
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <Sparkles size={16} className="mx-auto text-amber-500 mb-1" />
          <span>Recently listed at current price of {formatPrice(listing.price, listing.currency)}. Tracking future trend changes.</span>
        </div>
      )}
    </div>
  );
};
