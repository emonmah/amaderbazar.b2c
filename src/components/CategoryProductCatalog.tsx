'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductCard } from './ProductCard';
import { Sparkles, Tag, X, Filter, FolderTree, ArrowRight, Flame, Clock, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export interface Category {
  _id?: string;
  name: string;
  slug?: string;
  icon?: string;
  desc?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface Props {
  initialProducts: any[];
  initialCategories: Category[];
  hotDeals?: any[];
}

export const CategoryProductCatalog: React.FC<Props> = ({
  initialProducts = [],
  initialCategories = [],
  hotDeals = [],
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fallback categories if empty
  const defaultCategories: Category[] = [
    { name: 'মধু ও ঘি', icon: '🍯', description: 'সুন্দরবনের খাঁটি মধু ও সুগন্ধি গাওয়া ঘি' },
    { name: 'তেল ও বীজ', icon: '🫒', description: 'ঘানি ভাঙা সরিষা ও কালোজিরা তেল' },
    { name: 'ড্রাই ফ্রুটস ও বাদাম', icon: '🥜', description: 'মেডজুল খেজুর ও কাজু-পেস্তা বাদাম' },
    { name: 'মসলা ও ডাল', icon: '🌾', description: 'খাঁটি মসলা ও প্রিমিয়াম বাসমতি চাল' },
    { name: 'অর্গানিক স্বাস্থ্য', icon: '🌿', description: 'চিয়া সিড ও ভেষজ সম্পূরক' },
  ];

  const categories = initialCategories.length > 0 ? initialCategories : defaultCategories;

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

  // Read URL query param on mount if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('category');
      if (catParam) {
        const matched = categories.find(
          (c) => c.slug === catParam || c.name.toLowerCase() === catParam.toLowerCase()
        );
        if (matched) {
          setSelectedCategory(matched.name);
        } else {
          setSelectedCategory(catParam);
        }
      }
    }
  }, [categories]);

  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    const scrollAmount = 320;
    categoryScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!categoryScrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - categoryScrollRef.current.offsetLeft);
    setScrollLeft(categoryScrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !categoryScrollRef.current) return;
    const x = e.pageX - categoryScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 6) {
      setHasMoved(true);
    }
    categoryScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleCardClick = (cat: Category) => {
    if (hasMoved) return; // ignore click when dragging
    const targetSlug = cat.slug || encodeURIComponent(cat.name);
    router.push(`/collections/${targetSlug}`);
  };

  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        product.category === selectedCategory ||
        product.category?.toLowerCase() === selectedCategory?.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  const activeCategoryObj = categories.find((c) => c.name === selectedCategory);

  return (
    <div className="space-y-12">
      {/* 1. Category Highlights Section (Movable Slider with Prev/Next Controls & Dragging) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              ক্যাটাগরি সমূহ
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">জনপ্রিয় পণ্য বিভাগ</h2>
            <p className="text-xs text-slate-500">ক্যাটাগরি স্লাইড করে আপনার পছন্দের বিভাগ নির্বাচন করুন</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                সকল পণ্য ({initialProducts.length})
              </button>
            )}

            {/* Category Navigation Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="w-8 h-8 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-sm transition active:scale-95 border border-slate-200/60"
                title="পূর্ববর্তী ক্যাটাগরি"
                aria-label="Previous Category"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="w-8 h-8 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-sm transition active:scale-95 border border-slate-200/60"
                title="পরবর্তী ক্যাটাগরি"
                aria-label="Next Category"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Movable Categories Track (Draggable & Swipeable Horizontal Slider) */}
        <div className="relative">
          <div
            ref={categoryScrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth scrollbar-none py-2 px-0.5 snap-x select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const count = categoryCounts[cat.name] || 0;

              return (
                <button
                  key={cat._id || cat.name}
                  type="button"
                  onClick={() => handleCardClick(cat)}
                  className={`w-[155px] sm:w-[175px] md:w-[190px] flex-shrink-0 snap-start p-4 rounded-3xl border transition-all duration-200 text-center space-y-2 relative group flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30 scale-[1.02]'
                      : 'bg-white border-slate-200/90 hover:border-emerald-500 hover:shadow-xl text-slate-900'
                  }`}
                >
                  <div
                    className={`text-3xl transition-transform duration-300 group-hover:scale-110 ${
                      isSelected ? 'drop-shadow' : ''
                    }`}
                  >
                    {cat.icon || '🌿'}
                  </div>

                  <div
                    className={`font-extrabold text-sm leading-snug truncate w-full ${
                      isSelected ? 'text-white' : 'text-slate-900 group-hover:text-emerald-700'
                    }`}
                  >
                    {cat.name}
                  </div>

                  <div
                    className={`text-[11px] line-clamp-1 w-full ${
                      isSelected ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {cat.description || cat.desc || `${count} টি পণ্য`}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-emerald-700/80 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                    }`}
                  >
                    {count} টি পণ্য
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. 🔥 Hot Deals Flash Sale — Infinite Right-to-Left Marquee Slider */}
      {hotDeals && hotDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600 text-white shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4 fill-white animate-bounce" />
                  সীমিত সময়ের অফার • ধামাকা হট ডিল
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">🔥 আজকের স্পেশাল হট ডিলস</h2>
                <p className="text-xs sm:text-sm text-rose-100">
                  সেরা মানের প্রাকৃতিক পণ্যগুলোতে পাচ্ছেন আকর্ষণীয় ছাড় ও ক্যাশব্যাক অফার!
                </p>
              </div>

              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/10 self-start sm:self-auto">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>অফার শেষ হতে আর মাত্র কয়েক দিন বাকি!</span>
              </div>
            </div>

            {/* ── Infinite Marquee Slider ── */}
            {/* Outer wrapper: clips overflow + adds edge fade masks */}
            <div
              className="marquee-track relative overflow-hidden"
              style={{
                /* Fade edges using a mask gradient */
                maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              }}
            >
              {/* Inner flex track — duplicated cards for seamless loop */}
              <div className="flex gap-5 animate-marquee w-max">
                {/* First copy */}
                {hotDeals.map((product: any) => (
                  <div key={`a-${product._id}`} className="w-[230px] sm:w-[260px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
                {/* Duplicate copy — makes the loop seamless */}
                {hotDeals.map((product: any) => (
                  <div key={`b-${product._id}`} className="w-[230px] sm:w-[260px] flex-shrink-0" aria-hidden="true">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-[11px] text-white/50 mt-4 font-medium">
              ✋ হোভার করলে স্লাইড থামবে
            </p>
          </div>
        </section>
      )}

      {/* 3. Main Catalog Grid with Interactive Category Pills Filter */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              বিশুদ্ধ পণ্যের কালেকশন
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {selectedCategory === 'All' ? 'আমাদের সকল পণ্যসমূহ' : `${activeCategoryObj?.icon || '🌿'} ${selectedCategory}`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {selectedCategory === 'All'
                ? 'সেরা দামে সরাসরি কৃষকদের কাছ থেকে সংগৃহীত খাঁটি খাদ্যপণ্য'
                : activeCategoryObj?.description || `${selectedCategory} ক্যাটাগরির প্রাকৃতিক পণ্যসমূহ`}
            </p>
          </div>

          {/* Active Category Indicator & Count Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              মোট {filteredProducts.length} টি পণ্য পাওয়া গেছে
            </span>

            {selectedCategory !== 'All' && (
              <>
                <Link
                  href={`/collections/${activeCategoryObj?.slug || encodeURIComponent(selectedCategory)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                >
                  <span>কালেকশন পেজ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setSelectedCategory('All')}
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                  title="ফিল্টার মুছুন"
                >
                  <X className="w-3.5 h-3.5" />
                  রিসেট
                </button>
              </>
            )}
          </div>
        </div>

        {/* Category Pill Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {/* All Products Pill */}
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white border border-slate-200/90 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
            }`}
          >
            <span>🌿</span>
            <span>সকল পণ্য</span>
            <span
              className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === 'All' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {initialProducts.length}
            </span>
          </button>

          {/* Individual Category Pills */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const count = categoryCounts[cat.name] || 0;

            return (
              <button
                key={cat._id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 flex-shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-white border border-slate-200/90 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                }`}
              >
                <span>{cat.icon || '🌿'}</span>
                <span>{cat.name}</span>
                <span
                  className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtered Products Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-3xl flex items-center justify-center">
              {activeCategoryObj?.icon || '🔍'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                "{selectedCategory}" ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                আমাদের এই বিভাগে শীঘ্রই নতুন খাঁটি পণ্য যুক্ত করা হচ্ছে। অনুগ্রহ করে অন্যান্য বিভাগ ব্রাউজ করুন।
              </p>
            </div>
            <div>
              <button
                onClick={() => setSelectedCategory('All')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <ArrowRight className="w-4 h-4" />
                সকল পণ্য দেখুন
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
