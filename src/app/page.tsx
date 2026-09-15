import React from 'react';
import Link from 'next/link';
import { HeroSlider } from '../components/HeroSlider';
import { CategoryProductCatalog } from '../components/CategoryProductCatalog';
import {
  ShieldCheck,
  Truck,
  Leaf,
  Headphones,
} from 'lucide-react';

async function getHomeData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const [productsRes, slidersRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/catalog/products?limit=100`, {
        headers: { 'x-tenant-id': 'tenant-fashion-001' },
        cache: 'no-store',
      }),
      fetch(`${apiUrl}/catalog/sliders`, {
        headers: { 'x-tenant-id': 'tenant-fashion-001' },
        cache: 'no-store',
      }),
      fetch(`${apiUrl}/catalog/categories`, {
        headers: { 'x-tenant-id': 'tenant-fashion-001' },
        cache: 'no-store',
      }),
    ]);

    const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
    const slidersData = slidersRes.ok ? await slidersRes.json() : [];
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];

    return {
      products: productsData.products || [],
      sliders: Array.isArray(slidersData) ? slidersData : [],
      categories: Array.isArray(categoriesData) ? categoriesData : [],
    };
  } catch (err) {
    console.error('Failed to fetch home data:', err);
    return {
      products: [],
      sliders: [],
      categories: [],
    };
  }
}

export default async function HomePage() {
  const { products, sliders, categories } = await getHomeData();
  const hotDeals = products.filter((p: any) => p.isHotDeal);

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Hero Section with Carousel Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <HeroSlider initialSliders={sliders} />
      </section>

      {/* 2. Trust Badges / Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">১০০% প্রাকৃতিক ও বিশুদ্ধ</div>
              <div className="text-[11px] text-slate-500">কোনো প্রকার ক্ষতিকর প্রিজারভেটিভ নেই</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">ক্যাশ অন ডেলিভারি</div>
              <div className="text-[11px] text-slate-500">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">বিকাশ ও অনলাইন পেমেন্ট</div>
              <div className="text-[11px] text-slate-500">bKash & SSLCommerz গেটওয়ে</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">২৪/৭ কাস্টমার সাপোর্ট</div>
              <div className="text-[11px] text-slate-500">যেকোনো তথ্যে পাশে আছি আমরা</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3, 4 & 5. Category Highlights, Hot Deals & Catalog Grid with Interactive Category Filtering */}
      <CategoryProductCatalog
        initialProducts={products}
        initialCategories={categories}
        hotDeals={hotDeals}
      />
    </div>
  );
}
