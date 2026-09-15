import React from 'react';
import { notFound } from 'next/navigation';
import { ProductAddToCart } from './ProductAddToCart';
import { ProductReviews } from '../../../components/ProductReviews';
import { ShieldCheck, Truck, RotateCcw, Leaf, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60; // ISR: Revalidate static page on demand or every 60s

async function getProduct(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const res = await fetch(`${apiUrl}/catalog/products/${slug}`, {
      headers: { 'x-tenant-id': 'tenant-fashion-001' },
      next: { tags: [`product-${slug}`] },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link href="/" className="hover:text-emerald-700">হোম</Link>
        <span>/</span>
        <span className="text-emerald-700 font-semibold">{product.category}</span>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-lg">
            <img
              src={product.images[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.isHotDeal && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-white" />
                🔥 হট ডিল অফার
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200">
                  <img src={img} alt={`${product.title} ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Variant Selection */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {product.category}
              </span>
              {product.unit && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  ওজন: {product.unit}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Interactive Client Component for Pricing, Variants, Wishlist & Add to Cart */}
          <ProductAddToCart product={product} />

          {/* Product Attributes Details */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">পণ্যের বিবরণ</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                    <span className="text-slate-500 capitalize">{key}:</span>
                    <span className="font-bold text-slate-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Value Props */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <Truck className="w-5 h-5 mx-auto text-emerald-700" />
              <div className="mt-1.5 text-xs font-bold text-slate-800">দ্রুত ডেলিভারি</div>
              <div className="text-[10px] text-slate-500">Steadfast কুরিয়ার</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <Leaf className="w-5 h-5 mx-auto text-emerald-700" />
              <div className="mt-1.5 text-xs font-bold text-slate-800">১০০% অর্গানিক</div>
              <div className="text-[10px] text-slate-500">সম্পূর্ণ খাঁটি ও বিশুদ্ধ</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-5 h-5 mx-auto text-emerald-700" />
              <div className="mt-1.5 text-xs font-bold text-slate-800">ক্যাশ অন ডেলিভারি</div>
              <div className="text-[10px] text-slate-500">হাতে পেয়ে টাকা দিন</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Interactive Section */}
      <ProductReviews
        productId={product._id}
        productSlug={product.slug}
        initialRating={product.rating}
        initialNumReviews={product.numReviews}
      />
    </div>
  );
}
