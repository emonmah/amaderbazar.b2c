'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthModal } from '../../components/AuthModal';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  Truck,
  Leaf,
  ArrowRight,
  User,
  AlertCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { user, token, setAuth, isAuthenticated } = useAuthStore();

  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Active Payment Modal Simulation state
  const [activePaymentModal, setActivePaymentModal] = useState<'BKASH' | 'SSLCOMMERZ' | null>(null);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const [bkashStep, setBkashStep] = useState<'phone' | 'otp' | 'pin'>('phone');
  const [bkashPhone, setBkashPhone] = useState('01711223344');
  const [bkashOtp, setBkashOtp] = useState('123456');
  const [bkashPin, setBkashPin] = useState('12345');
  const [sslTab, setSslTab] = useState<'card' | 'mfs'>('mfs');

  // Customer & Shipping Form
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+8801711223344');
  const [address, setAddress] = useState('House 42, Road 11, Sector 4');
  const [city, setCity] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('1230');
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'SSLCOMMERZ' | 'COD'>('BKASH');

  useEffect(() => {
    setIdempotencyKey(`idemp_${uuidv4()}`);
    if (user) {
      setEmail(user.email);
      setFullName(user.name);
    } else {
      setEmail('');
      setFullName('');
    }
  }, [user]);

  const total = getTotalAmount();

  // 1-Click Social Logins inside Checkout
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
      setEmail(res.data.user.email);
      setFullName(res.data.user.name);
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
      setEmail(res.data.user.email);
      setFullName(res.data.user.name);
    } catch (e) {
      alert('Facebook Login failed');
    }
  };

  // Place Order Action
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated() || !user) {
      setIsAuthModalOpen(true);
      alert('পেমেন্ট ও অর্ডার সম্পন্ন করতে অনুগ্রহ করে আগে সাইন-ইন বা লগইন করুন।');
      return;
    }

    if (items.length === 0) {
      alert('আপনার কার্ট খালি!');
      return;
    }

    setLoading(true);
    try {
      const headers: any = {
        'x-tenant-id': 'tenant-fashion-001',
        'x-idempotency-key': idempotencyKey,
      };
      if (token) headers.authorization = `Bearer ${token}`;

      // 1. Submit Order
      const orderRes = await axios.post(
        `${API_BASE}/orders`,
        {
          customerEmail: email,
          paymentMethod,
          shippingAddress: {
            fullName,
            phone,
            addressLine1: address,
            city,
            postalCode,
            country: 'BD',
          },
          items: items.map((i) => ({
            variantSku: i.variantSku,
            title: i.title,
            quantity: i.quantity,
            unitPrice: i.price,
            reservationToken: i.reservationToken,
          })),
        },
        { headers }
      );

      const order = orderRes.data.order;

      // 2. Initiate Payment
      const payRes = await axios.post(
        `${API_BASE}/payments/initiate`,
        {
          orderId: order._id,
          gateway: paymentMethod,
          returnUrl: `http://localhost:3000/orders/${order._id}`,
        },
        { headers: { 'x-tenant-id': 'tenant-fashion-001' } }
      );

      if (paymentMethod === 'COD') {
        // Instant Cash on Delivery confirmation
        setCompletedOrder({
          order,
          payment: payRes.data,
        });
        clearCart();
      } else {
        // Open interactive payment simulation modal
        setPendingOrderData({ order, payment: payRes.data });
        setActivePaymentModal(paymentMethod);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'অর্ডার প্রসেস করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Complete Simulated bKash Payment
  const handleConfirmBkash = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/payments/verify/bkash`,
        {
          transactionId: pendingOrderData.payment.transactionId,
          amount: pendingOrderData.order.totalAmount,
        },
        { headers: { 'x-tenant-id': 'tenant-fashion-001' } }
      );

      setCompletedOrder({
        order: { ...pendingOrderData.order, status: 'CONFIRMED' },
        payment: res.data,
      });
      setActivePaymentModal(null);
      clearCart();
    } catch (err: any) {
      alert('bKash Verification error');
    } finally {
      setLoading(false);
    }
  };

  // Complete Simulated SSLCommerz Payment
  const handleConfirmSSLCommerz = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/payments/verify/sslcommerz`,
        {
          transactionId: pendingOrderData.payment.transactionId,
          amount: pendingOrderData.order.totalAmount,
        },
        { headers: { 'x-tenant-id': 'tenant-fashion-001' } }
      );

      setCompletedOrder({
        order: { ...pendingOrderData.order, status: 'CONFIRMED' },
        payment: res.data,
      });
      setActivePaymentModal(null);
      clearCart();
    } catch (err: any) {
      alert('SSLCommerz verification error');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Render: Order Confirmed Screen
  // ----------------------------------------------------
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            অর্ডার সফল হয়েছে • অর্ডার কনফার্মড
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            অর্ডার নম্বর: <span className="font-mono font-bold text-emerald-700">{completedOrder.order.orderNumber}</span>
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 text-left space-y-3 shadow-md">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">পেমেন্ট মেথড:</span>
            <span className="font-bold text-slate-800">{completedOrder.order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">ট্রানজেকশন আইডি:</span>
            <span className="font-mono text-emerald-700 font-semibold">{completedOrder.payment.transactionId}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
            <span className="text-slate-800 font-medium">{completedOrder.order.shippingAddress?.addressLine1}, {completedOrder.order.shippingAddress?.city}</span>
          </div>
          <div className="flex justify-between text-base font-black border-t border-slate-100 pt-3 text-slate-900">
            <span>সর্বমোট পরিশোধিত / প্রদেয়:</span>
            <span className="text-emerald-700 font-mono">৳{completedOrder.order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={`/orders/${completedOrder.order.orderNumber || completedOrder.order._id}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-800/20 transition flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>লাইভ অর্ডার ট্র্যাকিং দেখুন</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition"
          >
            দোকানে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>নিরাপদ ও এনক্রিপ্টেড চেকআউট • ঘরে বাজার সেফটি গ্যারান্টি</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-mono">
          <span>ইডেম্পোটেন্সি প্রটেকশন অন</span>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          চেকআউট ও ডেলিভারি তথ্য
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          অনুগ্রহ করে আপনার ডেলিভারি ঠিকানা ও সুবিধাজনক পেমেন্ট মাধ্যম নির্বাচন করুন।
        </p>
      </div>

      {/* Auth Banner for Checkout - Strict Gating */}
      {!isAuthenticated() && (
        <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="font-black text-xs text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>পেমেন্ট করতে সাইন-ইন / লগইন আবশ্যক (Login Required to Pay):</span>
            </div>
            <p className="text-[11px] text-amber-800/80">
              অর্ডার নিরাপত্তা, ক্যাশ অন ডেলিভারি এবং অনলাইন পেমেন্ট নিশ্চিত করতে অনুগ্রহ করে লগইন করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickGoogle}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={handleQuickFacebook}
              className="px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-xs font-bold text-white flex items-center gap-2 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              ইমেইল সাইন-ইন
            </button>
          </div>
        </div>
      )}

      {isAuthenticated() && user && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-800 font-semibold">
              লগইন আছেন: <strong className="text-slate-900">{user.name}</strong> ({user.email})
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono font-bold uppercase bg-white px-2 py-0.5 rounded border border-emerald-200">
            অটো-সিঙ্ক একটিভ
          </span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping and Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer & Address */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                ১
              </span>
              ডেলিভারি ঠিকানা ও গ্রাহকের তথ্য
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">আপনার পূর্ণ নাম</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahim Ahmed"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">মোবাইল ফোন নম্বর</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801711223344"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ইমেইল এড্রেস</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@gmail.com"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">শহর / জেলা</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Dhaka">ঢাকা (Dhaka)</option>
                  <option value="Chittagong">চট্টগ্রাম (Chittagong)</option>
                  <option value="Sylhet">সিলেট (Sylhet)</option>
                  <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                  <option value="Khulna">খুলনা (Khulna)</option>
                  <option value="Barisal">বরিশাল (Barisal)</option>
                  <option value="Rangpur">রংপুর (Rangpur)</option>
                  <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">বিস্তারিত ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 42, Road 11, Sector 4, Uttara"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method Selection */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                ২
              </span>
              পেমেন্ট মেথড নির্বাচন করুন
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* bKash Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('BKASH')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  paymentMethod === 'BKASH'
                    ? 'border-[#D12053] bg-pink-50/60 ring-2 ring-[#D12053]/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-[#D12053] text-sm">bKash বিকাশ</span>
                    <span className="text-[10px] bg-pink-100 text-[#D12053] px-2 py-0.5 rounded-full font-bold">
                      জনপ্রিয়
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    বিকাশ ওয়ালেট বা পিন দিয়ে ইনস্ট্যান্ট পেমেন্ট
                  </p>
                </div>
              </button>

              {/* SSLCommerz Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('SSLCOMMERZ')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  paymentMethod === 'SSLCOMMERZ'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-indigo-700 text-sm">SSLCommerz</span>
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    ভিসা, মাস্টারকার্ড, নগদ, রকেট ও নেট ব্যাংকিং
                  </p>
                </div>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-emerald-800 text-sm">ক্যাশ অন ডেলিভারি</span>
                    <Truck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Order Review */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 h-fit">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            অর্ডার সামারি
          </h2>

          <div className="space-y-3 text-xs text-slate-600 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.variantSku} className="flex justify-between items-center gap-2">
                <div className="truncate pr-2">
                  <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                  <div className="text-[10px] text-slate-400">পরিমাণ: x{item.quantity}</div>
                </div>
                <div className="font-bold text-slate-800 font-mono whitespace-nowrap">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>সাবটোটাল:</span>
              <span className="font-bold text-slate-800 font-mono">৳{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি চার্জ:</span>
              <span className="text-emerald-600 font-bold">ফ্রি (রমজান অফার)</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-100 pt-3">
            <span>সর্বমোট:</span>
            <span className="text-emerald-700 font-mono">৳{total.toLocaleString()}</span>
          </div>

          {!isAuthenticated() || !user ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-lg shadow-amber-900/20 transition active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              পেমেন্ট করতে প্রথমে লগইন করুন (Sign In to Pay)
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-800/20 transition active:scale-[0.99] disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'অর্ডার প্রসেস হচ্ছে...' : paymentMethod === 'COD' ? 'অর্ডার নিশ্চিত করুন' : 'পেমেন্ট করুন ও অর্ডার দিন'}
            </button>
          )}
        </div>
      </form>

      {/* ======================================================== */}
      {/* Modal: bKash Payment Simulation */}
      {/* ======================================================== */}
      {activePaymentModal === 'BKASH' && pendingOrderData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#D12053] text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl space-y-4 animate-in fade-in">
            {/* bKash Header */}
            <div className="p-6 bg-[#C01848] text-center relative border-b border-pink-700/50">
              <div className="font-black text-2xl tracking-tight">bKash বিকাশ</div>
              <div className="text-xs text-pink-200 mt-1">আমাদের বাজার (Amader Bazar) Merchant Checkout</div>
              <div className="mt-3 p-2 rounded-xl bg-white/10 text-xs font-mono font-bold">
                পরিশোধের পরিমাণ: ৳{pendingOrderData.order.totalAmount.toLocaleString()}
              </div>
            </div>

            {/* bKash Form Body */}
            <div className="p-6 bg-white text-slate-800 rounded-t-3xl space-y-4 text-xs">
              {bkashStep === 'phone' && (
                <div className="space-y-3">
                  <label className="block font-bold text-slate-700">আপনার বিকাশ একাউন্ট নম্বর দিন:</label>
                  <input
                    type="text"
                    value={bkashPhone}
                    onChange={(e) => setBkashPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#D12053]"
                  />
                  <p className="text-[11px] text-slate-500 text-center">
                    পরবর্তী ধাপে একটি ৬ ডিজিটের ওটিপি কোড পাঠানো হবে।
                  </p>
                  <button
                    type="button"
                    onClick={() => setBkashStep('otp')}
                    className="w-full py-3 rounded-xl bg-[#D12053] text-white font-bold text-sm hover:bg-[#B51744] shadow"
                  >
                    এগিয়ে যান (Next)
                  </button>
                </div>
              )}

              {bkashStep === 'otp' && (
                <div className="space-y-3">
                  <label className="block font-bold text-slate-700">বিকাশ ওটিপি (Verification Code) দিন:</label>
                  <input
                    type="text"
                    value={bkashOtp}
                    onChange={(e) => setBkashOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-center font-bold text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#D12053]"
                  />
                  <p className="text-[10px] text-emerald-600 text-center font-medium">
                    টেস্টিং স্যান্ডবক্স ওটিপি: 123456
                  </p>
                  <button
                    type="button"
                    onClick={() => setBkashStep('pin')}
                    className="w-full py-3 rounded-xl bg-[#D12053] text-white font-bold text-sm hover:bg-[#B51744] shadow"
                  >
                    যাচাই করুন (Verify)
                  </button>
                </div>
              )}

              {bkashStep === 'pin' && (
                <div className="space-y-3">
                  <label className="block font-bold text-slate-700">আপনার বিকাশ পিন (PIN) দিন:</label>
                  <input
                    type="password"
                    value={bkashPin}
                    onChange={(e) => setBkashPin(e.target.value)}
                    placeholder="•••••"
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-center font-bold text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#D12053]"
                  />
                  <p className="text-[10px] text-emerald-600 text-center font-medium">
                    স্যান্ডবক্স পিন: 12345 (সম্পূর্ণ নিরাপদ)
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmBkash}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#D12053] text-white font-bold text-sm hover:bg-[#B51744] shadow disabled:opacity-50"
                  >
                    {loading ? 'পেমেন্ট ভেরিফাই হচ্ছে...' : 'পেমেন্ট নিশ্চিত করুন (Confirm)'}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setActivePaymentModal(null)}
                className="w-full text-center text-slate-400 hover:text-slate-600 text-xs mt-2"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal: SSLCommerz Payment Simulation */}
      {/* ======================================================== */}
      {activePaymentModal === 'SSLCOMMERZ' && pendingOrderData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-4">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="font-extrabold text-base">SSLCOMMERZ Gateway</div>
                <div className="text-xs text-slate-400">Secure Payment for আমাদের বাজার (Amader Bazar)</div>
              </div>
              <div className="font-mono text-emerald-400 font-bold text-base">
                ৳{pendingOrderData.order.totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex rounded-xl bg-slate-100 p-1 font-bold">
                <button
                  type="button"
                  onClick={() => setSslTab('mfs')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    sslTab === 'mfs' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                  }`}
                >
                  মোবাইল ব্যাংকিং
                </button>
                <button
                  type="button"
                  onClick={() => setSslTab('card')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    sslTab === 'card' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                  }`}
                >
                  কার্ড / ডেবিট ও ক্রেডিট
                </button>
              </div>

              {sslTab === 'mfs' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-emerald-500 bg-emerald-50/50 text-center font-bold text-slate-800">
                    Nagad (নগদ)
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800">
                    Rocket (রকেট)
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800">
                    Upay (উপায়)
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800">
                    bKash (বিকাশ)
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    defaultValue="4111 2222 3333 4444"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    placeholder="Card Number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center"
                      placeholder="MM/YY"
                    />
                    <input
                      type="password"
                      defaultValue="123"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center"
                      placeholder="CVV"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmSSLCommerz}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-900/20 disabled:opacity-50"
              >
                {loading ? 'পেমেন্ট সম্পন্ন হচ্ছে...' : 'পেমেন্ট নিশ্চিত করুন (Pay Now)'}
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentModal(null)}
                className="w-full text-center text-slate-400 hover:text-slate-600 text-xs"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
