import React from 'react';
import { 
  Search, 
  X, 
  ArrowUpDown, 
  Briefcase, 
  GraduationCap, 
  User, 
  HeartPulse, 
  Sparkles, 
  Wallet,
  Layers
} from 'lucide-react';
import { FilterType, SortType, Category } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  activeCategory: Category | 'All';
  onCategoryChange: (c: Category | 'All') => void;
  activeSort: SortType;
  onSortChange: (s: SortType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    urgent: number;
    today: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  activeCategory,
  onCategoryChange,
  activeSort,
  onSortChange,
  counts,
}) => {
  const filterTabs: Array<{ id: FilterType; label: string; count: number }> = [
    { id: 'all', label: 'Barchasi', count: counts.all },
    { id: 'active', label: 'Jarayonda', count: counts.active },
    { id: 'completed', label: 'Bajarilgan', count: counts.completed },
    { id: 'urgent', label: 'Shoshilinch', count: counts.urgent },
    { id: 'today', label: 'Bugungi', count: counts.today },
  ];

  const categories: Array<{ id: Category | 'All'; label: string; icon: React.ReactNode }> = [
    { id: 'All', label: 'Barcha turlar', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'Ish', label: 'Ish', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'O\'qish', label: 'O\'qish', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'Shaxsiy', label: 'Shaxsiy', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'Sog\'liq', label: 'Sog\'liq', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { id: 'Loyiha', label: 'Loyiha', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'Moliya', label: 'Moliya', icon: <Wallet className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-3 mb-6">
      
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Vazifalardan qidirish..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto self-end">
          <div className="relative w-full sm:w-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value as SortType)}
              className="w-full sm:w-auto pl-8 pr-8 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition cursor-pointer appearance-none shadow-xs"
            >
              <option value="newest">Yangi qo'shilganlar</option>
              <option value="priority">Muhimlik darajasi</option>
              <option value="dueDate">Muddati bo'yicha</option>
              <option value="title">Alifbo tartibida</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100/80 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
