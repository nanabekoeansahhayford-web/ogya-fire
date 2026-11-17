import React from 'react';

interface GridSkeletonProps {
  count?: number;
  variant?: 'store' | 'listings';
}

export const ProductGridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 8,
  variant = 'listings',
}) => {
  return (
    <div
      aria-label="Loading marketplace items"
      className="grid grid-cols-2 sm:grid-cols-3 min-[1025px]:grid-cols-4 gap-2.5 sm:gap-4 min-[1025px]:gap-5"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col animate-pulse"
        >
          {/* Image grey box */}
          <div className="aspect-[4/3] w-full bg-slate-200 dark:bg-slate-800" />
          {/* Content grey lines */}
          <div className="p-2.5 sm:p-3.5 space-y-2.5 flex-1">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-11/12" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-10" />
            </div>
            <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            {variant === 'store' && (
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SectionSkeleton: React.FC<{ titleWidth?: string; cardCount?: number }> = ({
  titleWidth = 'w-56',
  cardCount = 4,
}) => (
  <section className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 py-6 w-full">
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 animate-pulse">
      <div className={`h-6 bg-slate-200 dark:bg-slate-800 rounded-lg ${titleWidth}`} />
      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-72 max-w-full" />
      <ProductGridSkeleton count={cardCount} />
    </div>
  </section>
);

export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen w-full bg-[#F8F9FA] dark:bg-[#0b0f19] p-4 sm:p-8 animate-pulse">
    <div className="max-w-[1280px] mx-auto space-y-6">
      <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      <ProductGridSkeleton count={6} />
    </div>
  </div>
);

export const ModalLoadingFallback: React.FC = () => (
  <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-sm shadow-2xl space-y-3 animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
    </div>
  </div>
);
