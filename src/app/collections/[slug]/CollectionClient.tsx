'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductCard } from '../../../components/ProductCard';
import {
  FolderTree,
  SlidersHorizontal,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Search,
} from 'lucide-react';

interface Category {
  _id?: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  category: string;
  basePrice: number;
  compareAtPrice?: number;
  discountPercent?: number;
  isHotDeal?: boolean;
  unit?: string;
  images: string[];
  description?: string;
  rating?: number;
  numReviews?: number;
}

interface Props {
  initialProducts: Product[];
  categories: Category[];
  currentSlug: string;
  categoryName: string;
  categoryDescription?: string;
  categoryIcon?: string;
}

export const CollectionClient: React.FC<Props> = ({
  initialProducts,
  categories,
  currentSlug,
  categoryName,
  categoryDescription,
  categoryIcon,
}) => {
  const router = useRouter();

  // Filter States
  const [selectedSubCat, setSelectedSubCat] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('default');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(5000);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Determine max price among products for the range slider
  const maxPossiblePrice = useMemo(() => {
    if (initialProducts.length === 0) return 5000;
    const max = Math.max(...initialProducts.map((p) => p.basePrice || 0));
    return Math.ceil(max / 100) * 100 || 5000;
  }, [initialProducts]);

  // Extract unique units for unit filter
  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.unit) units.add(p.unit);
    });
    return Array.from(units);
  }, [initialProducts]);

  // Calculate product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialProducts.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Subcategory / secondary category filter
    if (selectedSubCat !== 'all') {
      result = result.filter(
        (p) =>
          p.category === selectedSubCat ||
          p.category?.toLowerCase() === selectedSubCat.toLowerCase()
      );
    }

    // Price filter
    result = result.filter((p) => (p.basePrice || 0) <= maxPriceFilter);

    // Unit filter
    if (selectedUnit !== 'all') {
      result = result.filter((p) => p.unit === selectedUnit);
    }

    // Sorting
    switch (sortOption) {
      case 'price_low_high':
        result.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
        break;
      case 'price_high_low':
        result.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'discount':
        result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
      default:
        // Default sorting
        break;
    }

    return result;
  }, [initialProducts, searchFilter, selectedSubCat, maxPriceFilter, selectedUnit, sortOption]);

  const handleResetFilters = () => {
    setSelectedSubCat('all');
    setMaxPriceFilter(maxPossiblePrice);
    setSelectedUnit('all');
    setSortOption('default');
    setSearchFilter('');
  };

  const hasActiveFilters =
    selectedSubCat !== 'all' ||
    maxPriceFilter < maxPossiblePrice ||
    selectedUnit !== 'all' ||
    searchFilter.trim() !== '' ||
    sortOption !== 'default';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Breadcrumb & Header Title (Matching Ghorer Bazar Style) ── */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <span>›</span>
          <Link href="/collections/all" className="hover:text-emerald-700 transition">
            Collections
          </Link>
          <span>›</span>
          <span className="text-slate-900 font-bold">{categoryName}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              {categoryIcon && <span>{categoryIcon}</span>}
              <span>{categoryName}</span>
            </h1>
            {categoryDescription && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{categoryDescription}</p>
            )}
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            মোট {filteredProducts.length} টি পণ্য পাওয়া গেছে
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Toggle Button ── */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>ফিল্টার ও সাজান</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        {/* Mobile Sort dropdown */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="default">Default Sorting</option>
          <option value="price_low_high">Price: Low to High</option>
          <option value="price_high_low">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>

      {/* ── Two Column Layout (Sidebar Filters + Products Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* ── Left Sidebar: Filter Panel ── */}
        <aside
          className={`
            lg:block lg:sticky lg:top-24 space-y-6
            ${isMobileFilterOpen ? 'block' : 'hidden'}
            bg-white p-5 rounded-3xl border border-slate-200 shadow-sm
          `}
        >
          {/* Filter Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              ফিল্টার অপশন
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
              >
                রিসেট করুন
              </button>
            )}
          </div>

          {/* Search inside collection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              পণ্য অনুসন্ধান
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="যেমন: মধু, তেল, চাল..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Filter By Category (Matches Ghorer Bazar sidebar) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
              FILTER BY CATEGORY
            </h4>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1 text-xs">
              <button
                type="button"
                onClick={() => router.push('/collections/all')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition text-left ${
                  currentSlug === 'all'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>সকল ক্যাটাগরি (All)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${currentSlug === 'all' ? 'bg-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {initialProducts.length}
                </span>
              </button>

              {categories.map((cat) => {
                const isActiveCat = currentSlug === cat.slug || currentSlug === cat.name;
                const count = categoryCounts[cat.name] || 0;

                return (
                  <button
                    key={cat._id || cat.slug || cat.name}
                    type="button"
                    onClick={() => router.push(`/collections/${cat.slug || cat.name}`)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition text-left ${
                      isActiveCat
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{cat.icon || '🌿'}</span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${isActiveCat ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider (Matches Ghorer Bazar sidebar) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
                PRICE RANGE
              </h4>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                ৳0 - ৳{maxPriceFilter.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxPossiblePrice}
              step="50"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>৳0</span>
              <span>৳{maxPossiblePrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Unit / Weight Filter (e.g. 500gm, 1kg) */}
          {availableUnits.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-l-2 border-emerald-600 pl-2">
                প্যাকেজ সাইজ / ওজন
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedUnit('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedUnit === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  সবগুলো
                </button>
                {availableUnits.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setSelectedUnit(unit)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedUnit === unit
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              সকল ফিল্টার মুছুন
            </button>
          )}
        </aside>

        {/* ── Right Main Area: Products Grid ── */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar (Desktop) */}
          <div className="hidden lg:flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-600">
              দেখাচ্ছে: <span className="font-bold text-slate-900">{filteredProducts.length}</span> টি পণ্য
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="sort-dropdown" className="text-xs font-bold text-slate-700">
                Sort By :
              </label>
              <div className="relative">
                <select
                  id="sort-dropdown"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3.5 py-2 pr-8 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="default">Default Sorting</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Biggest Discount</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-medium">সক্রিয় ফিল্টার:</span>
              {searchFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                  অনুসন্ধান: "{searchFilter}"
                  <button type="button" onClick={() => setSearchFilter('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedUnit !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium">
                  ওজন: {selectedUnit}
                  <button type="button" onClick={() => setSelectedUnit('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {maxPriceFilter < maxPossiblePrice && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium font-mono">
                  সর্বোচ্চ: ৳{maxPriceFilter}
                  <button type="button" onClick={() => setMaxPriceFilter(maxPossiblePrice)}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-1"
              >
                রিসেট
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-3xl flex items-center justify-center">
                🔍
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-800">
                  কোনো পণ্য পাওয়া যায়নি
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  আপনার নির্বাচিত ফিল্টারে কোনো পণ্য মেলেনি। অনুগ্রহ করে ফিল্টার পরিবর্তন বা রিসেট করুন।
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  ফিল্টার রিসেট করে সব দেখুন
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
