import React from 'react';
import { CollectionClient } from './CollectionClient';

export const revalidate = 60; // ISR cache revalidation

async function getCategoryData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/catalog/products?limit=100`, {
        headers: { 'x-tenant-id': 'tenant-fashion-001' },
        cache: 'no-store',
      }),
      fetch(`${apiUrl}/catalog/categories`, {
        headers: { 'x-tenant-id': 'tenant-fashion-001' },
        cache: 'no-store',
      }),
    ]);

    const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];

    return {
      products: productsData.products || [],
      categories: Array.isArray(categoriesData) ? categoriesData : [],
    };
  } catch (err) {
    console.error('Failed to fetch category data:', err);
    return {
      products: [],
      categories: [],
    };
  }
}

// Slugs translation/fallback mapping (covers English names, Bengali, and URL slugs)
const CATEGORY_SLUG_MAP: Record<string, { name: string; icon: string; description: string }> = {
  'honey-and-ghee': { name: 'মধু ও ঘি (Honey & Ghee)', icon: '🍯', description: 'সুন্দরবনের খাঁটি মধু ও সুগন্ধি গাওয়া ঘি' },
  'oil-and-seeds': { name: 'তেল ও বীজ (Oil & Ghee/Seeds)', icon: '🫒', description: 'ঘানি ভাঙা সরিষা ও কালোজিরা তেল' },
  'dry-fruits-nuts': { name: 'ড্রাই ফ্রুটস ও বাদাম (Dates, Nuts & Seeds)', icon: '🥜', description: 'মেডজুল খেজুর ও কাজু-পেস্তা বাদাম' },
  'spices-and-pulses': { name: 'মসলা ও ডাল (Spices & Pulses)', icon: '🌾', description: 'খাঁটি মসলা ও প্রিমিয়াম চাল' },
  'spices': { name: 'মসলা সমগ্র (Spices Collection)', icon: '🌾', description: 'রান্নার সেরা স্বাদের জন্য খাঁটি ও বাছাইকৃত মসলা' },
  'organic-health': { name: 'অর্গানিক স্বাস্থ্য (Organic Health)', icon: '🌿', description: 'চিয়া সিড ও প্রাকৃতিক ভেষজ সম্পূরক' },
  'tea-and-coffee': { name: 'চা ও কফি (Beverage / Tea & Coffee)', icon: '☕', description: 'সিলেটের প্রিমিয়াম চা ও অ্যারাবিকা কফি' },
  'honey': { name: 'মধু ও ঘি (Honey & Ghee)', icon: '🍯', description: '১০০% প্রাকৃতিক চাকের খাঁটি মধু' },
  'dates': { name: 'মেডজুল খেজুর ও ড্রাই ফ্রুটস', icon: '🥜', description: 'মদিনার বাছাইকৃত জাম্বো মেডজুল খেজুর' },
  'all': { name: 'সকল পণ্য (All Collections)', icon: '📦', description: 'আমাদের বাজারের সম্পূর্ণ স্বাস্থ্যকর পণ্য সংগ্রহ' },
};

export default async function CategoryCollectionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { hotDeals?: string };
}) {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const { products, categories } = await getCategoryData();

  // Find matching category from database or fallback map
  const matchedDbCategory = categories.find(
    (c: any) =>
      c.slug?.toLowerCase() === decodedSlug ||
      c.name?.toLowerCase() === decodedSlug ||
      c.slug?.toLowerCase() === decodedSlug.replace(/\s+/g, '-')
  );

  const fallbackInfo = CATEGORY_SLUG_MAP[decodedSlug] || {
    name: matchedDbCategory?.name || (decodedSlug === 'all' ? 'সকল পণ্য' : decodedSlug.replace(/-/g, ' ').toUpperCase()),
    icon: matchedDbCategory?.icon || '🌿',
    description: matchedDbCategory?.description || '',
  };

  const finalName = matchedDbCategory?.name || fallbackInfo.name;
  const finalIcon = matchedDbCategory?.icon || fallbackInfo.icon;
  const finalDescription = matchedDbCategory?.description || fallbackInfo.description;

  // Filter products relevant to this collection
  let relevantProducts = products;
  if (searchParams.hotDeals === 'true') {
    relevantProducts = products.filter((p: any) => p.isHotDeal);
  } else if (decodedSlug !== 'all') {
    relevantProducts = products.filter((p: any) => {
      if (!p.category) return false;
      const catLower = p.category.toLowerCase();
      // Match by DB name, DB slug, or fallback
      if (matchedDbCategory && p.category === matchedDbCategory.name) return true;
      if (catLower.includes(decodedSlug) || decodedSlug.includes(catLower)) return true;
      if (matchedDbCategory && catLower.includes(matchedDbCategory.slug?.toLowerCase())) return true;
      return false;
    });

    // If filtering by slug returned 0 products due to exact naming difference, fallback to all products so user still sees the store!
    if (relevantProducts.length === 0 && products.length > 0) {
      relevantProducts = products;
    }
  }

  return (
    <CollectionClient
      initialProducts={relevantProducts}
      categories={categories}
      currentSlug={decodedSlug}
      categoryName={finalName}
      categoryDescription={finalDescription}
      categoryIcon={finalIcon}
    />
  );
}
