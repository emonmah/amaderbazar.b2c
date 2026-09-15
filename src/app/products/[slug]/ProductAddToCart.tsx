'use client';

import React, { useState } from 'react';
import { useCartStore } from '../../../store/useCartStore';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { Check, ShoppingBag, Heart, Flame, Percent } from 'lucide-react';

export const ProductAddToCart: React.FC<{ product: any }> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleFavourite, isFavourite } = useWishlistStore();

  const variants = product.variants || [];
  const [selectedSku, setSelectedSku] = useState<string>(variants[0]?.sku || `${product.slug}-def`);
  const [added, setAdded] = useState(false);

  const activeVariant = variants.find((v: any) => v.sku === selectedSku) || variants[0] || {
    sku: `${product.slug}-def`,
    price: product.basePrice,
  };

  const price = activeVariant.price || product.basePrice;
  const comparePrice = activeVariant.compareAtPrice || product.compareAtPrice;
  const discountPercent = product.discountPercent;
  const isFav = isFavourite(product._id);

  const handleAddToCart = () => {
    addItem({
      variantSku: activeVariant.sku,
      title: `${product.title} ${activeVariant.size ? `(${activeVariant.size})` : ''}`,
      price,
      image: product.images[0],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleFav = () => {
    toggleFavourite({
      _id: product._id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      basePrice: price,
      compareAtPrice: comparePrice,
      discountPercent,
      unit: product.unit,
      image: product.images[0],
      rating: product.rating,
      numReviews: product.numReviews,
    });
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200">
      {/* Price & Savings Display */}
      <div className="flex items-baseline gap-4 flex-wrap">
        <span className="text-3xl sm:text-4xl font-black text-slate-900">
          ৳{price.toLocaleString()}
        </span>

        {comparePrice && comparePrice > price && (
          <div className="flex items-center gap-2">
            <span className="text-base text-slate-400 line-through">
              ৳{comparePrice.toLocaleString()}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
              {discountPercent ? `${discountPercent}% ছাড়` : `৳${comparePrice - price} সাশ্রয়`}
            </span>
          </div>
        )}

        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          ইন স্টক (স্টকে আছে)
        </span>
      </div>

      {/* Variant Selection (Weight / Pack Size) */}
      {variants.length > 1 && (
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            প্যাকেজ সাইজ / ওজন নির্বাচন করুন
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {variants.map((v: any) => (
              <button
                key={v.sku}
                type="button"
                onClick={() => setSelectedSku(v.sku)}
                className={`p-3 rounded-2xl border text-left text-xs transition ${
                  selectedSku === v.sku
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-slate-900">{v.size || v.color || 'স্ট্যান্ডার্ড প্যাক'}</div>
                <div className="text-emerald-700 font-mono font-bold mt-1">৳{v.price.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions: Add To Bag + Wishlist Favourite */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-800/20 transition active:scale-[0.99]"
        >
          {added ? (
            <>
              <Check className="w-5 h-5" />
              <span>ব্যাগে যোগ করা হয়েছে!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>ব্যাগে যোগ করুন</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleToggleFav}
          className={`p-4 rounded-2xl border transition flex items-center justify-center ${
            isFav
              ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 text-slate-500 hover:text-rose-500 bg-white'
          }`}
          title={isFav ? 'পছন্দ থেকে বাদ দিন' : 'পছন্দের তালিকায় রাখুন'}
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
        </button>
      </div>
    </div>
  );
};
