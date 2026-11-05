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
  return (
    <div className="bg-white dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 py-3 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              17 Verified Categories
            </span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        {/* Scrollable category list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            <CategoryIcon categoryId="all" size={15} />
            <span>All Categories</span>
            <span
              className={`text-[11px] tabular-nums font-mono ${
                selectedCategory === 'all' ? 'text-slate-300 dark:text-slate-800 font-bold' : 'text-slate-400 dark:text-slate-400'
              }`}
            >
              ({categoryCounts['all'] || 0})
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60'
                }`}
                title={cat.shortDesc}
              >
                <CategoryIcon
                  categoryId={cat.id}
                  size={15}
                  className={isSelected ? 'text-slate-950' : 'text-slate-600 dark:text-slate-300'}
                />
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] tabular-nums font-mono ${
                      isSelected ? 'text-slate-900 font-bold' : 'text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    ({count})
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
