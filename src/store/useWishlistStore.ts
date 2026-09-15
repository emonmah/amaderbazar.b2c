import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  basePrice: number;
  compareAtPrice?: number;
  discountPercent?: number;
  unit?: string;
  image?: string;
  rating?: number;
  numReviews?: number;
}

interface WishlistStore {
  items: WishlistItem[];
  toggleFavourite: (product: WishlistItem) => void;
  isFavourite: (productId: string) => boolean;
  removeFavourite: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggleFavourite: (product) => {
        const { items } = get();
        const exists = items.some((i) => i._id === product._id);
        if (exists) {
          set({ items: items.filter((i) => i._id !== product._id) });
        } else {
          set({ items: [...items, product] });
        }
      },

      isFavourite: (productId) => {
        return get().items.some((i) => i._id === productId);
      },

      removeFavourite: (productId) => {
        set({ items: get().items.filter((i) => i._id !== productId) });
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'amaderbazar_wishlist_storage',
    }
  )
);
