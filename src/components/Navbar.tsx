'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Menu,
  X,
  Search,
  Flame,
} from 'lucide-react';

export const Navbar: React.FC<{ tenantSlug?: string }> = ({ tenantSlug = 'amaderbazar' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, logout, isAuthenticated } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [categories, setCategories] = useState<{ name: string; slug: string; icon?: string }[]>([
    { name: 'মধু ও ঘি', slug: 'honey-and-ghee', icon: '🍯' },
    { name: 'তেল ও বীজ', slug: 'oil-and-seeds', icon: '🫒' },
    { name: 'ড্রাই ফ্রুটস ও বাদাম', slug: 'dry-fruits-nuts', icon: '🥜' },
    { name: 'মসলা ও ডাল', slug: 'spices-and-pulses', icon: '🌾' },
    { name: 'অর্গানিক স্বাস্থ্য', slug: 'organic-health', icon: '🌿' },
    { name: 'চা ও কফি', slug: 'tea-and-coffee', icon: '☕' },
  ]);

  useEffect(() => {
    setMounted(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    fetch(`${apiUrl}/catalog/categories`, {
      headers: { 'x-tenant-id': 'tenant-fashion-001' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/collections/all?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const totalItemsCount = mounted ? items.reduce((s, i) => s + i.quantity, 0) : 0;
  const totalWishlistCount = mounted ? wishlistItems.length : 0;
  const isUserLoggedIn = mounted ? isAuthenticated() : false;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* Top Announcement Bar */}
        <div className="bg-emerald-700 text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
          <span>🌿 ১০০% বিশুদ্ধ ও প্রাকৃতিক পণ্য ঘরে বসেই ডেলিভারি নিন • হট ডিলে পাচ্ছেন আকর্ষণীয় ছাড়!</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0" onClick={handleLinkClick}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/30 group-hover:scale-105 transition">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="hidden xs:block sm:block">
              <div className="font-black text-base sm:text-xl tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
                <span>আমাদের বাজার</span>
                <span className="hidden sm:inline text-emerald-600 font-bold text-xs uppercase font-sans tracking-normal bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Amader Bazar
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 hidden sm:block">
                Pure & Organic Food Store
              </div>
            </div>
          </Link>

          {/* Middle Search Bar (Matches Ghorer Bazar Header) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="পণ্য বা ক্যাটাগরি খুঁজুন (Search in store)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-300 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Action Icons — always visible */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              onClick={handleLinkClick}
              className="relative p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition flex items-center gap-1 text-xs font-semibold"
              title="পছন্দের তালিকা"
            >
              <Heart className={`w-5 h-5 ${totalWishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
              <span className="hidden lg:inline">পছন্দ</span>
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black flex items-center justify-center text-white">
                  {totalWishlistCount}
                </span>
              )}
            </Link>

            {/* My Orders */}
            <Link
              href="/orders"
              onClick={handleLinkClick}
              className="hidden sm:flex p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition items-center gap-1.5 text-xs font-semibold"
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">অর্ডারসমূহ</span>
            </Link>

            {/* User Profile / Auth Button */}
            {isUserLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                  <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs font-medium text-slate-700"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700" onClick={handleLinkClick}>
                      <Package className="w-4 h-4 text-emerald-600" />
                      আমার অর্ডারসমূহ
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-slate-700" onClick={handleLinkClick}>
                      <Heart className="w-4 h-4 text-rose-500" />
                      পছন্দের তালিকা
                    </Link>
                    <button
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
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
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>লগইন</span>
              </button>
            )}

            {/* Shopping Cart */}
            <Link
              href="/cart"
              onClick={handleLinkClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition text-xs font-bold shadow-md shadow-emerald-800/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">ব্যাগ</span>
              {totalItemsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-emerald-700 text-[11px] font-extrabold shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition ml-0.5"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Category Navigation Bar (Matches Ghorer Bazar Secondary Nav) ── */}
        <div className="bg-slate-900 text-slate-200 border-t border-slate-800 text-xs font-semibold">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-2 whitespace-nowrap">
            <Link
              href="/collections/all?hotDeals=true"
              onClick={handleLinkClick}
              className="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold hover:bg-slate-800"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>অফার জোন (Offer Zone)</span>
            </Link>

            {categories.map((cat) => {
              const isActive =
                pathname === `/collections/${cat.slug}` ||
                pathname === `/collections/${encodeURIComponent(cat.name)}`;

              return (
                <Link
                  key={cat.slug || cat.name}
                  href={`/collections/${cat.slug || encodeURIComponent(cat.name)}`}
                  onClick={handleLinkClick}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                </Link>
              );
            })}

            <Link
              href="/collections/all"
              onClick={handleLinkClick}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                pathname === '/collections/all'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>সকল পণ্য (All)</span>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="পণ্য বা ক্যাটাগরি খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Auth section on mobile */}
              {!isUserLoggedIn ? (
                <button
                  onClick={() => { setIsAuthOpen(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 transition"
                >
                  <User className="w-5 h-5 text-emerald-600" />
                  লগইন / সাইন আপ করুন
                </button>
              ) : (
                <div className="px-3 py-2 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-1">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{user?.name}</div>
                    <div className="text-[11px] text-slate-500">{user?.email}</div>
                  </div>
                </div>
              )}

              <Link
                href="/orders"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700 transition"
              >
                <Package className="w-5 h-5 text-emerald-600" />
                আমার অর্ডারসমূহ
              </Link>

              <Link
                href="/wishlist"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700 transition"
              >
                <Heart className={`w-5 h-5 ${totalWishlistCount > 0 ? 'text-rose-500' : 'text-slate-500'}`} />
                পছন্দের তালিকা
                {totalWishlistCount > 0 && (
                  <span className="ml-auto text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {totalWishlistCount}
                  </span>
                )}
              </Link>

              {/* Mobile Category Links */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
                  ক্যাটাগরি সমূহ
                </div>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  <Link
                    href="/collections/all?hotDeals=true"
                    onClick={handleLinkClick}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50"
                  >
                    <span>🔥 অফার জোন</span>
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug || cat.name}
                      href={`/collections/${cat.slug || encodeURIComponent(cat.name)}`}
                      onClick={handleLinkClick}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-100"
                    >
                      <span>{cat.icon || '🌿'}</span>
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {isUserLoggedIn && (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 text-sm font-semibold text-rose-600 transition border-t border-slate-100 mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  লগআউট
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
