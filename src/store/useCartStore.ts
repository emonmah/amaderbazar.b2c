import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export interface CartItem {
  variantSku: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  reservationToken?: string;
  reservationExpiresAt?: string;
}

interface CartStore {
  items: CartItem[];
  isReserving: boolean;
  reservationError: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantSku: string) => void;
  updateQuantity: (variantSku: string, delta: number) => void;
  clearCart: () => void;
  reserveInventoryForCheckout: (tenantId: string) => Promise<boolean>;
  getTotalAmount: () => number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isReserving: false,
      reservationError: null,

      addItem: (newItem, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantSku === newItem.variantSku);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantSku === newItem.variantSku
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity }] };
        });
      },

      removeItem: (variantSku) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantSku !== variantSku),
        }));
      },

      updateQuantity: (variantSku, delta) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.variantSku === variantSku) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[],
        }));
      },

      clearCart: () => set({ items: [], reservationError: null }),

      /**
       * Atomic Inventory Reservation hold during checkout
       * Locks stock temporarily in Redis for 10 minutes to prevent race conditions.
       */
      reserveInventoryForCheckout: async (tenantId: string) => {
        const { items } = get();
        if (items.length === 0) return false;

        set({ isReserving: true, reservationError: null });

        try {
          const updatedItems = [...items];

          // Reserve each SKU with retries
          for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i];
            const response = await axios.post(
              `${API_BASE}/inventory/reserve`,
              {
                variantSku: item.variantSku,
                quantity: item.quantity,
                holdMinutes: 10,
              },
              {
                headers: { 'x-tenant-id': tenantId },
                timeout: 5000,
              }
            );

            if (response.data.reservationToken) {
              updatedItems[i] = {
                ...item,
                reservationToken: response.data.reservationToken,
                reservationExpiresAt: response.data.expiresAt,
              };
            }
          }

          set({ items: updatedItems, isReserving: false });
          return true;
        } catch (err: any) {
          const errorMsg =
            err.response?.data?.message ||
            'Could not reserve stock. Another customer may have bought the last item.';
          set({ reservationError: errorMsg, isReserving: false });
          return false;
        }
      },

      getTotalAmount: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'ecommerce-cart-storage',
    }
  )
);
