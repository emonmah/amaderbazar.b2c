'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthModal } from '../../components/AuthModal';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight, Check, Lock, User } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function WishlistPage() {
  const { items, removeFavourite, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [addedSku, setAddedSku] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuickGoogle = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/auth/oauth`,
        {
          provider: 'google',
          email: 'rahim.google@gmail.com',
          name: 'Rahim Ahmed',
        },
        { headers: { 'x-tenant-id': 'tenant-fashion-001' } }
      );
      setAuth(res.data.user, res.data.accessToken);
    } catch (e) {
      alert('Google Login failed');
    }
  };

  const handleQuickFacebook = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/auth/oauth`,
        {
          provider: 'facebook',
          email: 'karim.fb@gmail.com',
          name: 'Karim Chowdhury',
        },
        { headers: { 'x-tenant-id': 'tenant-fashion-001' } }
      );
      setAuth(res.data.user, res.data.accessToken);
    } catch (e) {
      alert('Facebook Login failed');
    }
  };

  if (!mounted) return null;

  // Gate Wishlist: Must be logged in
  if (!isAuthenticated()) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center shadow-inner relative">
          <Heart className="w-8 h-8 fill-rose-500" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center">
            <Lock className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            পছন্দের তালিকা দেখতে লগইন করুন
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            আপনার পছন্দের সব অর্গানিক ও বিশুদ্ধ পণ্য এক তালিকায় সংরক্ষণ করতে এবং পরবর্তী ভিজিটে সহজে খুঁজে পেতে সাইন ইন করুন।
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <button
            type="button"
            onClick={handleQuickGoogle}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-sm transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google দিয়ে প্রবেশ করুন</span>
          </button>

          <button
            type="button"
            onClick={handleQuickFacebook}
            className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook দিয়ে প্রবেশ করুন</span>
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white px-2">অথবা</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-800/20 transition"
          >
            ইমেইল ও পাসওয়ার্ড দিয়ে লগইন / রেজিস্ট্রেশন
          </button>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          হোমপেজে ফিরে যান
        </Link>

        {isAuthModalOpen && (
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        )}
      </div>
    );
  }

  const handleAddToCart = (product: any) => {
    addItem({
      variantSku: `${product.slug}-def`,
      title: product.title,
      price: product.basePrice,
      image: product.image,
    });
    setAddedSku(product._id);
    setTimeout(() => setAddedSku(null), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            কেনাকাটা চালিয়ে যান
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            আমার পছন্দের পণ্যসমূহ (Wishlist)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার পছন্দের সব অর্গানিক ও ফ্রেশ পণ্য এক তালিকায় সংরক্ষিত রয়েছে।
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 self-start sm:self-auto"
          >
            তালিকা খালি করুন
          </button>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">আপনার পছন্দের তালিকা খালি!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            যেকোনো পণ্যের ওপরের হার্ট (❤️) আইকনে ক্লিক করে সহজেই পছন্দের তালিকায় যোগ করতে পারেন।
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition"
          >
            <span>পণ্যগুলো দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-slate-50">
                <Link href={`/products/${item.slug}`}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => removeFavourite(item._id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 shadow-sm transition"
                  title="বাদ দিন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition line-clamp-2 mt-1">
                      {item.title}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-base font-black text-slate-900">
                    ৳{item.basePrice.toLocaleString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    {addedSku === item._id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>যুক্ত হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>ব্যাগে নিন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
