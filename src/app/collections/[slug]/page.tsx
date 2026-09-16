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

// Fallback name & icon map for standard slugs
const CATEGORY_SLUG_MAP: Record<string, { name: string; icon: string; description: string }> = {
  'honey-and-ghee': { name: 'মধু ও ঘি', icon: '🍯', description: 'সুন্দরবনের খাঁটি মধু ও সুগন্ধি গাওয়া ঘি' },
  'oil-and-seeds': { name: 'তেল ও বীজ', icon: '🫒', description: 'ঘানি ভাঙা সরিষা ও কালোজিরা তেল' },
  'dry-fruits-nuts': { name: 'ড্রাই ফ্রুটস ও বাদাম', icon: '🥜', description: 'মেডজুল খেজুর ও কাজু-পেস্তা বাদাম' },
  'spices-and-pulses': { name: 'মসলা ও ডাল', icon: '🌾', description: 'খাঁটি মসলা ও প্রিমিয়াম চাল' },
  'spices': { name: 'মসলা সমগ্র', icon: '🌾', description: 'রান্নার সেরা স্বাদের জন্য খাঁটি ও বাছাইকৃত মসলা' },
  'organic-health': { name: 'অর্গানিক স্বাস্থ্য', icon: '🌿', description: 'চিয়া সিড ও প্রাকৃতিক ভেষজ সম্পূরক' },
  'tea-and-coffee': { name: 'চা ও কফি', icon: '☕', description: 'সিলেটের প্রিমিয়াম চা ও অ্যারাবিকা কফি' },
  'honey': { name: 'মধু ও ঘি', icon: '🍯', description: '১০০% প্রাকৃতিক চাকের খাঁটি মধু' },
  'dates': { name: 'মেডজুল খেজুর ও ড্রাই ফ্রুটস', icon: '🥜', description: 'মদিনার বাছাইকৃত জাম্বো মেডজুল খেজুর' },
  'all': { name: 'সকল পণ্য (All Collections)', icon: '📦', description: 'আমাদের বাজারের সম্পূর্ণ স্বাস্থ্যকর খাদ্যপণ্য সংগ্রহ' },
};

export default async function CategoryCollectionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { hotDeals?: string; search?: string };
}) {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const { products, categories } = await getCategoryData();

  // Find matching category from database
  const matchedDbCategory = categories.find(
    (c: any) =>
      c.slug?.toLowerCase().trim() === decodedSlug ||
      c.name?.toLowerCase().trim() === decodedSlug ||
      c.slug?.toLowerCase().replace(/\s+/g, '-') === decodedSlug
  );

  const fallbackInfo = CATEGORY_SLUG_MAP[decodedSlug] || {
    name: matchedDbCategory?.name || (decodedSlug === 'all' ? 'সকল পণ্য' : decodedSlug.replace(/-/g, ' ')),
    icon: matchedDbCategory?.icon || '🌿',
    description: matchedDbCategory?.description || '',
  };

  const finalName = matchedDbCategory?.name || fallbackInfo.name;
  const finalIcon = matchedDbCategory?.icon || fallbackInfo.icon;
  const finalDescription = matchedDbCategory?.description || fallbackInfo.description;

  // Strict category filtering: Only include products that truly match this category
  let relevantProducts: any[] = [];

  if (decodedSlug === 'all') {
    // Show all products or hot deals
    relevantProducts = searchParams.hotDeals === 'true'
      ? products.filter((p: any) => p.isHotDeal)
      : products;
  } else {
    relevantProducts = products.filter((p: any) => {
      if (!p.category) return false;
      const pCat = p.category.trim().toLowerCase();

      // 1. Direct match with matched DB category name
      if (matchedDbCategory) {
        if (p.category.trim() === matchedDbCategory.name.trim()) return true;
        if (pCat === matchedDbCategory.name.trim().toLowerCase()) return true;
        if (matchedDbCategory.slug && pCat === matchedDbCategory.slug.trim().toLowerCase()) return true;
      }

      // 2. Direct match with current slug
      if (pCat === decodedSlug) return true;
      if (pCat.replace(/\s+/g, '-') === decodedSlug) return true;

      // 3. Match with fallback map name
      if (fallbackInfo && fallbackInfo.name && pCat === fallbackInfo.name.trim().toLowerCase()) return true;

      return false;
    });

    if (searchParams.hotDeals === 'true') {
      relevantProducts = relevantProducts.filter((p: any) => p.isHotDeal);
    }
  }

  // NOTE: If relevantProducts is empty (e.g. 0 products in "তেল ও বীজ"),
  // it MUST remain empty so CollectionClient displays "0 টি পণ্য" and the empty state!
  // NEVER fallback to unrelated products.

  return (
    <CollectionClient
      allProducts={products}
      categoryProducts={relevantProducts}
      categories={categories}
      currentSlug={decodedSlug}
      categoryName={finalName}
      categoryDescription={finalDescription}
      categoryIcon={finalIcon}
      isHotDealsOnly={searchParams.hotDeals === 'true'}
    />
  );
}
