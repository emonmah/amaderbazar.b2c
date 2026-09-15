'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, CheckCircle2, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export const ProductReviews: React.FC<{ productId: string; productSlug: string; initialRating?: number; initialNumReviews?: number }> = ({
  productId,
  productSlug,
  initialRating = 5,
  initialNumReviews = 0,
}) => {
  const { user, token } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState(user?.name || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name && !userName) {
      setUserName(user.name);
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/catalog/products/${productId || productSlug}/reviews`, {
        headers: { 'x-tenant-id': 'tenant-fashion-001' },
      });
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, productSlug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !userName.trim()) return;

    setSubmitting(true);
    try {
      const headers: any = { 'x-tenant-id': 'tenant-fashion-001' };
      if (token) headers.authorization = `Bearer ${token}`;

      const res = await axios.post(
        `${API_BASE}/catalog/products/${productId || productSlug}/reviews`,
        {
          rating,
          comment,
          userName,
          userEmail: user?.email || 'customer@gmail.com',
        },
        { headers }
      );

      setSuccessMsg('আপনার মূল্যবান মতামতের জন্য ধন্যবাদ! রিভিউ সফলভাবে যুক্ত হয়েছে।');
      setComment('');
      if (res.data.review) {
        setReviews((prev) => [res.data.review, ...prev]);
      } else {
        fetchReviews();
      }

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'রিভিউ জমা দিতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : initialRating.toFixed(1);

  return (
    <section className="border-t border-slate-200 pt-12 space-y-8">
      {/* Header & Score Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            কাস্টমার রিভিউ ও রেটিং
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            গ্রাহক পর্যালোচনা ({reviews.length > 0 ? reviews.length : initialNumReviews})
          </h2>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div className="text-4xl font-black text-emerald-800">{avgRating}</div>
          <div>
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              ১০০% ভেরিফাইড ক্রেতাদের রিভিউ
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Review Submission Form */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 h-fit">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>আপনার রিভিউ দিন</span>
          </h3>
          <p className="text-xs text-slate-500">
            পণ্যটি ব্যবহার করে আপনার অভিজ্ঞতা অন্যদের সাথে শেয়ার করুন।
          </p>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            {/* Star Rating Picker */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">আপনার রেটিং নির্বাচন করুন</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-125 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-slate-700 text-sm">{hoverRating || rating} স্টার</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">আপনার নাম</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Rahim Ahmed"
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">আপনার মতামত লিখুন</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="পণ্যের গুণমান, প্যাকেজিং ও ডেলিভারি নিয়ে আপনার সৎ মতামত লিখুন..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-800/20 transition active:scale-[0.99] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'জমা হচ্ছে...' : 'রিভিউ জমা দিন'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">রিভিউ লোড হচ্ছে...</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-400" />
              <div className="font-bold text-slate-700 text-sm">এখনো কোনো রিভিউ দেওয়া হয়নি</div>
              <p className="text-xs text-slate-500">
                প্রথম ব্যক্তি হিসেবে এই পণ্যে আপনার রিভিউ দিন!
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            ভেরিফাইড ক্রেতা
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
