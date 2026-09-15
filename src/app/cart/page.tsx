'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    getTotalAmount,
    reserveInventoryForCheckout,
    isReserving,
    reservationError,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = getTotalAmount();

  const handleCheckout = async () => {
    try {
      await reserveInventoryForCheckout('tenant-fashion-001');
    } catch (e) {
      // Graceful continuation
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">আপনার শপিং ব্যাগ খালি</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          ঘরে বাজারের ১০০% বিশুদ্ধ ও অর্গানিক পণ্যের কালেকশন থেকে আপনার পছন্দের পণ্য ব্যাগে যোগ করুন।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition"
        >
          <span>কেনাকাটা শুরু করুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          শপিং ব্যাগ (Shopping Bag)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          অর্ডার সম্পন্ন করতে ব্যাগে থাকা পণ্যগুলো যাচাই করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantSku}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-100 bg-slate-50 flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">{item.title}</h3>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{item.variantSku}</div>
                <div className="mt-1.5 text-sm font-black text-emerald-700 font-mono">
                  ৳{item.price.toLocaleString()}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.variantSku, -1)}
                    className="p-2 hover:bg-slate-200 text-slate-600 rounded-l-xl transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.variantSku, 1)}
                    className="p-2 hover:bg-slate-200 text-slate-600 rounded-r-xl transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.variantSku)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition"
                  title="বাদ দিন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 h-fit">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            অর্ডার সামারি
          </h2>

          <div className="space-y-2 text-xs text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span>সাবটোটাল:</span>
              <span className="font-bold text-slate-900 font-mono">৳{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি ফি:</span>
              <span className="text-emerald-700 font-bold">ফ্রি (রমজান অফার)</span>
            </div>
          </div>

          <div className="flex justify-between text-base font-black text-slate-900">
            <span>মোট প্রদেয়:</span>
            <span className="text-emerald-700 font-mono text-lg">৳{total.toLocaleString()}</span>
          </div>

          <button
            type="button"
            disabled={isReserving}
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-800/20 transition active:scale-[0.99] disabled:opacity-50"
          >
            {isReserving ? (
              <span>স্টক ভেরিফাই হচ্ছে...</span>
            ) : (
              <>
                <span>চেকআউট করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>নিরাপদ পেমেন্ট ও ১০ মিনিটের স্টক হোল্ড</span>
          </p>
        </div>
      </div>
    </div>
  );
}
