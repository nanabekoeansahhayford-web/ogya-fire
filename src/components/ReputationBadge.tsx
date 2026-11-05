import React, { useState } from 'react';
import { Award, ShieldCheck, Zap, CheckCircle2, Sparkles, Info } from 'lucide-react';
import { BadgeStyleConfig, BADGE_DEFINITIONS } from '../utils/reputation';
import { SellerBadgeId } from '../types/marketplace';

interface ReputationBadgeProps {
  badge: BadgeStyleConfig | SellerBadgeId;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  interactive?: boolean;
  onClick?: (badge: BadgeStyleConfig, e: React.MouseEvent) => void;
  className?: string;
  as?: 'button' | 'span';
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  badge: badgeProp,
  size = 'sm',
  showTooltip = true,
  interactive = true,
  onClick,
  className = '',
  as,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const badge: BadgeStyleConfig =
    typeof badgeProp === 'string' ? BADGE_DEFINITIONS[badgeProp] : badgeProp;

  if (!badge) return null;

  const renderIcon = (iconSize: number) => {
    switch (badge.iconName) {
      case 'Award':
        return <Award size={iconSize} className="shrink-0" />;
      case 'ShieldCheck':
        return <ShieldCheck size={iconSize} className="shrink-0" />;
      case 'Zap':
        return <Zap size={iconSize} className="shrink-0 fill-current" />;
      case 'CheckCircle2':
        return <CheckCircle2 size={iconSize} className="shrink-0" />;
      case 'Sparkles':
        return <Sparkles size={iconSize} className="shrink-0" />;
      default:
        return <Award size={iconSize} className="shrink-0" />;
    }
  };

  // Sizing definitions
  const sizeStyles = {
    xs: {
      container: 'text-[10px] px-1.5 py-0.5 gap-1 rounded-md font-bold',
      iconSize: 11,
    },
    sm: {
      container: 'text-[11px] px-2 py-0.5 gap-1.5 rounded-lg font-bold',
      iconSize: 12,
    },
    md: {
      container: 'text-xs px-2.5 py-1 gap-1.5 rounded-lg font-bold',
      iconSize: 13,
    },
    lg: {
      container: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2 rounded-xl font-extrabold',
      iconSize: 16,
    },
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick(badge, e);
    }
  };

  const isClickable = Boolean(onClick);
  const shouldUseSpan = as === 'span' || (!as && !interactive && !isClickable);

  const commonClasses = `inline-flex items-center border transition-all duration-150 ${sizeStyles.container} ${badge.bgLight} ${badge.textLight} ${badge.borderLight} ${badge.bgDark} ${badge.textDark} ${badge.borderDark} ${
    interactive || isClickable
      ? 'cursor-pointer hover:shadow-xs hover:scale-102 active:scale-98'
      : 'cursor-default'
  }`;

  return (
    <div
      className={`relative inline-flex items-center group/badge ${className}`}
      onMouseEnter={() => showTooltip && setIsTooltipOpen(true)}
      onMouseLeave={() => showTooltip && setIsTooltipOpen(false)}
    >
      {shouldUseSpan ? (
        <span
          onClick={isClickable ? handleClick : undefined}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onKeyDown={
            isClickable
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.(badge, e as unknown as React.MouseEvent);
                  }
                }
              : undefined
          }
          className={commonClasses}
          title={`${badge.label}: ${badge.description}`}
        >
          {renderIcon(sizeStyles.iconSize)}
          <span className="truncate">{size === 'xs' ? badge.shortLabel : badge.label}</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={!interactive && !isClickable}
          className={commonClasses}
          title={`${badge.label}: ${badge.description}`}
        >
          {renderIcon(sizeStyles.iconSize)}
          <span className="truncate">{size === 'xs' ? badge.shortLabel : badge.label}</span>
        </button>
      )}

      {/* Hover popover / mini explanation card */}
      {showTooltip && isTooltipOpen && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 dark:bg-slate-950 text-white text-xs rounded-xl shadow-xl border border-slate-700/80 dark:border-slate-800 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
            {renderIcon(13)}
            <span>{badge.label} Badge</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-2">{badge.description}</p>
          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-start gap-1">
            <Info size={11} className="shrink-0 mt-0.5 text-slate-400" />
            <span>Criteria: {badge.criteria}</span>
          </div>
          <div className="w-2 h-2 bg-slate-900 dark:bg-slate-950 border-r border-b border-slate-700/80 dark:border-slate-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};
