import React from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Star,
  Clock,
  Check,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { SellerInfo } from '../types/marketplace';
import { BADGE_DEFINITIONS, getSellerReputation, BadgeStyleConfig } from '../utils/reputation';

interface ReputationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller?: SellerInfo | null;
  activeBadgeId?: string | null;
}

export const ReputationDetailsModal: React.FC<ReputationDetailsModalProps> = ({
  isOpen,
  onClose,
  seller,
  activeBadgeId,
}) => {
  if (!isOpen) return null;

  const reputation = seller ? getSellerReputation(seller) : null;
  const allBadges: BadgeStyleConfig[] = Object.values(BADGE_DEFINITIONS);

  const getBadgeIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case 'Award':
        return <Award size={size} className="shrink-0" />;
      case 'ShieldCheck':
        return <ShieldCheck size={size} className="shrink-0" />;
      case 'Zap':
        return <Zap size={size} className="shrink-0 fill-current" />;
      case 'CheckCircle2':
        return <CheckCircle2 size={size} className="shrink-0" />;
      case 'Sparkles':
        return <Sparkles size={size} className="shrink-0" />;
      default:
        return <Award size={size} className="shrink-0" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Seller Reputation & Trust System
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                How OGYA (FIRE) 🔥 evaluates and certifies verified merchants
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Active Seller Spotlight Card (if opened for a specific seller) */}
          {seller && reputation && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-5 border border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                    {seller.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-white">{seller.name}</span>
                      {seller.isVerified && (
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-amber-400 font-bold tracking-wide">
                      {reputation.tierName}
                    </span>
                  </div>
                </div>

                {/* Score Dial */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-2.5 flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Trust Rating</span>
                    <span className="text-xl font-black text-emerald-400 tabular-nums">
                      {reputation.score}%
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-black text-xs">
                    ✓
                  </div>
                </div>
              </div>

              {/* Active badges earned by this seller */}
              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Badges Earned by {seller.name} ({reputation.badges.length})
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {reputation.badges.map((b) => (
                    <div
                      key={b.badgeId}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${b.bgLight} ${b.textLight} ${b.borderLight} ${b.bgDark} ${b.textDark} ${b.borderDark}`}
                    >
                      {getBadgeIcon(b.iconName, 13)}
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics row */}
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-medium">Buyer Rating</span>
                  <span className="font-extrabold text-amber-400 text-sm">★ {seller.rating.toFixed(1)}</span>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-medium">Response Rate</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{reputation.responseRatePercent}%</span>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-medium">Avg. Response Time</span>
                  <span className="font-extrabold text-sky-400 text-sm">{reputation.averageResponseTime}</span>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-medium">Verified Reviews</span>
                  <span className="font-extrabold text-white text-sm">{seller.reviewCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* All Reputation Badges Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Shield size={14} className="text-amber-500" />
              <span>Official Reputation Badges & Criteria</span>
            </h4>

            <div className="space-y-3">
              {allBadges.map((badge) => {
                const isActive = activeBadgeId === badge.badgeId;
                const sellerHasThisBadge = reputation?.badges.some((b) => b.badgeId === badge.badgeId);

                return (
                  <div
                    key={badge.badgeId}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'ring-2 ring-amber-500 bg-amber-50/20 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badge.bgLight} ${badge.textLight} ${badge.borderLight} ${badge.bgDark} ${badge.textDark} ${badge.borderDark}`}
                        >
                          {getBadgeIcon(badge.iconName, 18)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-950 dark:text-white">
                              {badge.label}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 rounded-full">
                              {badge.tagline}
                            </span>
                            {seller && (
                              sellerHasThisBadge ? (
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check size={10} /> Earned
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                  Not yet earned
                                </span>
                              )
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="font-bold text-slate-700 dark:text-slate-200">How to qualify:</span>
                        <span>{badge.criteria}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safe Trader Guarantee info card */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-950 dark:text-emerald-200">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm block">
                Buyer Protection Guarantee
              </span>
              <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed text-[11px] sm:text-xs">
                Badges are dynamically verified by OGYA algorithms based on authentic user reviews, confirmed identity documentation, and live communication logs. Badges cannot be bought and are immediately revoked if standards fall below thresholds.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
