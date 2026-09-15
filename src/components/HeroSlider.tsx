'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface SliderItem {
  _id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
}

const DEFAULT_SLIDES: SliderItem[] = [
  {
    _id: 'default-1',
    title: 'আমাদের বাজার - খাঁটি ও প্রাকৃতিক পণ্যের বিশ্বস্ত প্রতিষ্ঠান',
    subtitle: 'আমাদের বাজারে পাচ্ছেন ১০০% ভেজালমুক্ত সুন্দরবনের খাঁটি মধু, ঘানি ভাঙা সরিষার তেল ও প্রিমিয়াম গাওয়া ঘি সরাসরি ঘরে ডেলিভারি।',
    badge: '🔥 বিশেষ ছাড় - ২০% পর্যন্ত ক্যাশব্যাক!',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '#catalog',
    buttonText: 'অর্ডার করুন',
  },
  {
    _id: 'default-2',
    title: 'সুন্দরবনের ১০০% প্রাকৃতিক চাকের মধু',
    subtitle: 'সরাসরি সুন্দরবনের গভীর অরণ্যের মৌয়ালদের থেকে সংগৃহীত। কোনো প্রকার কৃত্রিম চিনি বা তাপমুক্ত প্রাকৃতিক গুণাবলী।',
    badge: '⭐ সেরা হট ডিল অফার',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/products/sundarban-raw-natural-honey',
    buttonText: 'মধু কিনুন',
  },
  {
    _id: 'default-3',
    title: 'প্রিমিয়াম মেডজুল খেজুর ও ড্রাই ফ্রুটস',
    subtitle: 'মদিনার বাছাইকৃত রসালো জাম্বো মেডজুল খেজুর ও উন্নতমানের বাদামের স্বাস্থ্যকর কম্বো।',
    badge: '🌿 অর্গানিক ও ফ্রেশ',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/products/premium-medjool-dates',
    buttonText: 'কালেকশন দেখুন',
  },
];

export const HeroSlider: React.FC<{ initialSliders?: SliderItem[] }> = ({ initialSliders }) => {
  const slides = initialSliders && initialSliders.length > 0 ? initialSliders : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border border-slate-200">
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide._id || index} className="relative min-w-full aspect-[16/7] sm:aspect-[21/8] min-h-[340px]">
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.70]"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex items-center px-6 sm:px-12 md:px-16">
              <div className="max-w-2xl space-y-3 sm:space-y-4 text-white">
                {slide.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    {slide.badge}
                  </span>
                )}

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-2 leading-relaxed max-w-xl drop-shadow">
                    {slide.subtitle}
                  </p>
                )}

                <div className="pt-2">
                  <Link
                    href={slide.linkUrl || '/#catalog'}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/40 transition active:scale-95"
                  >
                    <span>{slide.buttonText || 'অর্ডার করুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === idx ? 'w-8 bg-emerald-500 shadow' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
