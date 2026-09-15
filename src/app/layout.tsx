import './globals.css';
import { Navbar } from '../components/Navbar';
import { headers } from 'next/headers';

export const metadata = {
  title: 'আমাদের বাজার (Amader Bazar) - Pure & Organic Online Shop',
  description: '১০০% খাঁটি ও প্রাকৃতিক পণ্যের বিশ্বস্ত অনলাইন শপ। সুন্দরবনের মধু, সরিষার তেল, গাওয়া ঘি ও অর্গানিক খাবার।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'amaderbazar';

  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar tenantSlug={tenantSlug} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-500 space-y-2">
          <p className="font-bold text-slate-800">
            © 2026 আমাদের বাজার (Amader Bazar). সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-[11px] text-slate-500">
            খাঁটি মধু, কাঠের ঘানি ভাঙা তেল, দেশি গাওয়া ঘি, প্রিমিয়াম খেজুর ও অর্গানিক ফুড ডেলিভারি
          </p>
          <p className="font-mono text-[10px] text-slate-400 pt-2">
            পেমেন্ট মাধ্যম: bKash (বিকাশ) • SSLCommerz • ক্যাশ অন ডেলিভারি (COD) • কুরিয়ার: Steadfast Logistics
          </p>
        </footer>
      </body>
    </html>
  );
}
