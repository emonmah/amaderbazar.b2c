'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { AuthModal } from './AuthModal';
import {
  ShoppingBag,
  Heart,
  User,
  Package,
  LogOut,
  Leaf,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC<{ tenantSlug?: string }> = ({ tenantSlug = 'amaderbazar' }) => {
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, logout, isAuthenticated } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItemsCount = mounted ? items.reduce((s, i) => s + i.quantity, 0) : 0;
  const totalWishlistCount = mounted ? wishlistItems.length : 0;
  const isUserLoggedIn = mounted ? isAuthenticated() : false;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* Top Announcement Bar */}
        <div className="bg-emerald-700 text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
          <span>🌿 ১০০% বিশুদ্ধ ও প্রাকৃতিক পণ্য ঘরে বসেই ডেলিভারি নিন • হট ডিলে পাচ্ছেন আকর্ষণীয় ছাড়!</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/30 group-hover:scale-105 transition">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-xl tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
                <span>আমাদের বাজার</span>
                <span className="text-emerald-600 font-bold text-xs uppercase font-sans tracking-normal bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Amader Bazar
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
                Pure & Organic Food Store
              </div>
            </div>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist / Favourites Button */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition flex items-center gap-1 text-xs font-semibold"
              title="পছন্দের তালিকা (Wishlist)"
            >
              <Heart className={`w-5 h-5 ${totalWishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
              <span className="hidden sm:inline">পছন্দ</span>
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black flex items-center justify-center text-white">
                  {totalWishlistCount}
                </span>
              )}
            </Link>

            {/* My Orders Direct Link */}
            <Link
              href="/orders"
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">অর্ডারসমূহ</span>
            </Link>

            {/* User Profile / Auth Button */}
            {isUserLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                  <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs font-medium text-slate-700 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>

                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700"
                    >
                      <Package className="w-4 h-4 text-emerald-600" />
                      আমার অর্ডারসমূহ
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      পছন্দের তালিকা
                    </Link>

                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-rose-50 text-rose-600 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      লগআউট
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>লগইন / সাইন আপ</span>
              </button>
            )}

            {/* Shopping Cart Bag */}
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition text-xs font-bold shadow-md shadow-emerald-800/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">ব্যাগ</span>
              {totalItemsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-emerald-700 text-[11px] font-extrabold shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
