'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Check,
  RotateCcw,
  ArrowLeft,
  Calendar,
  CreditCard,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const PIPELINE_STEPS = [
  { key: 'PENDING', label: 'অর্ডার প্লেসড', desc: 'অর্ডার সিস্টেমে গৃহীত হয়েছে' },
  { key: 'CONFIRMED', label: 'অর্ডার নিশ্চিত', desc: 'পেমেন্ট ও স্টক কনফার্মড' },
  { key: 'PACKED', label: 'প্যাকেজিং সম্পন্ন', desc: 'ওয়্যারহাউসে প্যাকেট প্রস্তুত' },
  { key: 'SHIPPED', label: 'পথে রয়েছে', desc: 'কুরিয়ারে হস্তান্তর করা হয়েছে' },
  { key: 'DELIVERED', label: 'ডেলিভারি সম্পন্ন', desc: 'গ্রাহকের ঠিকানায় পৌঁছেছে' },
];

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/orders/${params.id}`, {
        headers: { 'x-tenant-id': 'tenant-fashion-001' },
      });
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'অর্ডারটি খুঁজে পাওয়া যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        অর্ডারের লাইভ তথ্য লোড হচ্ছে...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{error || 'অর্ডার পাওয়া যায়নি'}</h2>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          অর্ডারের তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const currentStepIndex = PIPELINE_STEPS.findIndex((s) => s.key === order.status);
  const activeStepIdx = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" />
          সকল অর্ডারের তালিকায় ফিরুন
        </Link>

        <button
          onClick={fetchOrder}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Main Order Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-900">
                #{order.orderNumber}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                {order.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                অর্ডারের সময়:{' '}
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

          <div className="text-right self-start sm:self-auto">
            <div className="text-xs text-slate-400">সর্বমোট প্রদেয়</div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ৳{order.totalAmount?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Visual Progress Timeline */}
        {/* ======================================================== */}
        <div className="pt-4 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            লাইভ অর্ডার ট্র্যাকিং ও অগ্রগতি
          </h3>

          <div className="relative">
            {/* Horizontal Line */}
            <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${(activeStepIdx / (PIPELINE_STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {PIPELINE_STEPS.map((step, idx) => {
                const isPassed = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition shadow-sm ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-emerald-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-[10px] text-slate-400 sm:line-clamp-2 mt-0.5">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Courier & Tracking Code Notice */}
        {order.trackingNumber && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900 mt-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <div className="font-bold">
                  কুরিয়ার পার্টনার: {order.courierName || 'Steadfast Courier'}
                </div>
                <div className="text-[11px] text-indigo-700 font-mono mt-0.5">
                  ট্র্যাকিং কোড: <strong>{order.trackingNumber}</strong>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-white px-3 py-1.5 rounded-xl border border-indigo-200">
              পথে রয়েছে
            </span>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 text-xs shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            ডেলিভারি ঠিকানা
          </h3>
          <div className="space-y-1.5 text-slate-600">
            <div className="font-bold text-slate-900">{order.shippingAddress?.fullName}</div>
            <div>ফোন: {order.shippingAddress?.phone}</div>
            <div>ঠিকানা: {order.shippingAddress?.addressLine1}</div>
            <div>শহর/জেলা: {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}</div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 text-xs shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            পেমেন্ট তথ্য
          </h3>
          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>পেমেন্ট মাধ্যম:</span>
              <strong className="text-slate-900">{order.paymentMethod || 'COD'}</strong>
            </div>
            <div className="flex justify-between">
              <span>পেমেন্ট স্ট্যাটাস:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus === 'PAID' ? 'পরিশোধিত (PAID)' : 'অপেক্ষমাণ (UNPAID)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>মুদ্রা:</span>
              <strong className="font-mono text-slate-900">{order.currency || 'BDT'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-600" />
          অর্ডারকৃত পণ্যসমূহ
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900">{item.title}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  মূল্য: ৳{item.unitPrice?.toLocaleString()} × {item.quantity}
                </div>
              </div>
              <div className="font-bold text-slate-900 font-mono text-sm">
                ৳{item.totalPrice?.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
          <span>সর্বমোট মূল্য:</span>
          <span className="text-emerald-700 font-mono text-base">
            ৳{order.totalAmount?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
