'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Check, Flame, Star, Percent } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleFavourite, isFavourite } = useWishlistStore();

  const [added, setAdded] = useState(false);
  const isFav = isFavourite(product._id);

  const activeVariant = product.variants?.[0] || { sku: `${product.slug}-def`, price: product.basePrice };
  const price = product.basePrice || activeVariant.price || 0;
  const comparePrice = product.compareAtPrice;
  const discountPercent = product.discountPercent;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      variantSku: activeVariant.sku,
      title: product.title,
      price,
      image: product.images?.[0],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleFavourite({
      _id: product._id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      basePrice: price,
      compareAtPrice: comparePrice,
      discountPercent,
      unit: product.unit,
      image: product.images?.[0],
      rating: product.rating,
      numReviews: product.numReviews,
    });
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:border-emerald-300 relative">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </Link>

        {/* Badges on Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isHotDeal && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse">
              <Flame className="w-3 h-3 fill-white" />
              হট ডিল
            </span>
          )}

          {discountPercent && discountPercent > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-md">
              <Percent className="w-2.5 h-2.5" />
              {discountPercent}% ছাড়
            </span>
          ) : null}
        </div>

        {/* Mark as Favourite (Heart) on Top Right */}
        <button
          type="button"
          onClick={handleToggleFav}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/70 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:scale-110 shadow-sm transition active:scale-95"
          title={isFav ? 'পছন্দের তালিকা থেকে বাদ দিন' : 'পছন্দের তালিকায় রাখুন'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Unit Tag on Bottom Left */}
        {product.unit && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
            {product.unit}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">{product.category}</span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.rating || 5.0}
              <span className="text-slate-400 font-normal">({product.numReviews || 12})</span>
            </span>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Quick Add */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-black text-slate-900 tracking-tight">
              ৳{price.toLocaleString()}
            </div>
            {comparePrice && comparePrice > price && (
              <div className="text-xs text-slate-400 line-through -mt-1 font-medium">
                ৳{comparePrice.toLocaleString()}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>যুক্ত হয়েছে!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>কিনুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
