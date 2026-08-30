// context/CartContext.jsx — Zustand-powered global cart store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Zustand cart store with localStorage persistence.
 *
 * State:
 *   items      — array of { productId, title, price, quantity, lensType, arAssetUrl }
 *   totalItems — derived count
 *   totalPrice — derived sum
 *
 * Actions:
 *   addItem(item)          — add or increment
 *   removeItem(productId, lensType)
 *   updateQuantity(productId, lensType, qty)
 *   clearCart()
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ── Derived ────────────────────────────────────────────────────
      get totalItems() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0)
      },
      get totalPrice() {
        return get().items.reduce((acc, i) => acc + i.price * i.quantity, 0)
      },

      // ── Actions ─────────────────────────────────────────────────────
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.lensType === item.lensType
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.lensType === item.lensType
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] }
        }),

      removeItem: (productId, lensType) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.lensType === lensType)
          ),
        })),

      updateQuantity: (productId, lensType, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.lensType === lensType
                ? { ...i, quantity: qty }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'visionframe-cart', // localStorage key
    }
  )
)

