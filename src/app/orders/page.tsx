'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthModal } from '../../components/AuthModal';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Search,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Calendar,
  Lock,
  ArrowLeft,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface Order {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  items: {
    variantSku: string;
    title: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'অপেক্ষমাণ (Pending)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  CONFIRMED: { label: 'কনফার্মড (Confirmed)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  PACKED: { label: 'প্যাকেজিং হচ্ছে (Packed)', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  SHIPPED: { label: 'পথে রয়েছে (Shipped)', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  DELIVERED: { label: 'ডেলিভারি সম্পন্ন (Delivered)', color: 'text-teal-800', bg: 'bg-teal-50 border-teal-200' },
  CANCELLED: { label: 'বাতিল (Cancelled)', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

export default function OrdersPage() {
  const { user, token, isAuthenticated, setAuth } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState(user?.email || '');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const fetchOrders = async (targetEmail?: string) => {
    setLoading(true);
    try {
      const emailToUse = targetEmail || user?.email || searchEmail;
      if (!emailToUse) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const headers: any = { 'x-tenant-id': 'tenant-fashion-001' };
      if (token) headers.authorization = `Bearer ${token}`;

      const res = await axios.get(`${API_BASE}/orders?email=${encodeURIComponent(emailToUse)}`, {
        headers,
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setSearchEmail(user.email);
      fetchOrders(user.email);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchEmail);
  };

  if (!mounted) return null;

  // Gate Orders: Must be logged in
  if (!isAuthenticated()) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-inner relative">
          <Package className="w-8 h-8" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center">
            <Lock className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            অর্ডার হিস্ট্রি দেখতে লগইন করুন
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            আপনার অতীতের সব অর্ডার ট্র্যাক করতে, লাইভ ডেলিভারি স্ট্যাটাস ও ইনভয়েস দেখতে আপনার একাউন্টে সাইন ইন করুন।
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <Package className="w-4 h-4" />
            কাস্টমার অর্ডার হিস্ট্রি
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            আমার অর্ডারসমূহ ও বর্তমান স্ট্যাটাস
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            আপনার অতীতের সকল অর্ডারের তালিকা ও লাইভ ডেলিভারি স্ট্যাটাস দেখুন।
          </p>
        </div>

        {/* Email Lookup Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="আপনার ইমেইল দিন..."
            className="p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-60"
            required
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition whitespace-nowrap"
          >
            অর্ডার খুঁজুন
          </button>
        </form>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">অর্ডার লোড হচ্ছে...</div>
      ) : orders.length === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">কোনো অর্ডার পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-mono text-slate-700 font-semibold">{searchEmail}</span> দিয়ে কোনো অর্ডার নেই। অনুগ্রহ করে আপনার সঠিক ইমেইল দিয়ে খুঁজুন অথবা নতুন পণ্য অর্ডার করুন।
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
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_LABELS[order.status] || {
              label: order.status,
              color: 'text-slate-700',
              bg: 'bg-slate-100',
            };

            return (
              <div
                key={order._id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-base">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">সর্বমোট মূল্য</div>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        ৳{order.totalAmount.toLocaleString()}
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order.orderNumber || order._id}`}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition border border-emerald-200"
                    >
                      <span>ট্র্যাকিং দেখুন</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1 text-xs text-slate-600">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1">
                      <span className="text-slate-800 font-medium">
                        • {item.title} <span className="text-slate-400 font-mono">x{item.quantity}</span>
                      </span>
                      <span className="font-mono text-slate-700">
                        ৳{item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer status summary */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <div>
                    পেমেন্ট মেথড:{' '}
                    <strong className="text-slate-700">{order.paymentMethod || 'COD'}</strong>
                    {order.paymentStatus === 'PAID' ? (
                      <span className="ml-1 text-emerald-600 font-bold">(পরিশোধিত)</span>
                    ) : (
                      <span className="ml-1 text-amber-600 font-bold">(অপেক্ষমাণ)</span>
                    )}
                  </div>
                  <div>গ্রাহক: {order.customerEmail}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
