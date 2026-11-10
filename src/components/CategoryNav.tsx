import React from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryId } from '../types/marketplace';
import { CategoryIcon } from './CategoryIcon';

interface CategoryNavProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (id: CategoryId | 'all') => void;
  categoryCounts: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  // Focus on the 9 primary super-app categories requested
  const primaryCategories = CATEGORIES.slice(0, 9);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 py-3 shadow-xs sticky top-16 z-30 transition-colors duration-200 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-wider flex items-center gap-1.5">
              <span>🔥</span>
              <span>Shop Ghana By Category</span>
            </span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs font-bold text-[#FF6600] hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>✕</span>
              <span>Show All Items</span>
            </button>
          )}
        </div>

        {/* Responsive Category Buttons: horizontal scroll with snap on phone, 4-5 per row on tablet, full row on PC */}
        <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 scrollbar-none no-scrollbar sm:grid sm:grid-cols-4 md:grid-cols-5 lg:flex lg:flex-wrap lg:items-center lg:gap-2 lg:overflow-visible sm:snap-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 sm:shrink cursor-pointer snap-start min-h-[40px] ${
              selectedCategory === 'all'
                ? 'bg-[#FF6600] text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-slate-700/70'
            }`}
          >
            <CategoryIcon categoryId="all" size={16} />
            <span>All Categories</span>
            <span
              className={`text-[11px] tabular-nums font-mono px-1.5 py-0.2 rounded-md ${
                selectedCategory === 'all'
                  ? 'bg-black/20 text-white font-bold'
                  : 'bg-slate-200/70 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300'
              }`}
            >
              {categoryCounts['all'] || 0}
            </span>
          </button>

          {primaryCategories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 sm:shrink cursor-pointer snap-start min-h-[40px] ${
                  isSelected
                    ? 'bg-[#FF6600] text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-slate-700/70'
                }`}
                title={cat.shortDesc}
              >
                <CategoryIcon
                  categoryId={cat.id}
                  size={16}
                  className={isSelected ? 'text-white' : 'text-[#FF6600] dark:text-orange-400'}
                />
                <span className="truncate">{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] tabular-nums font-mono px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-black/20 text-white font-bold'
                        : 'bg-slate-200/70 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
