import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductVariant } from "@/types/database";

export interface CartItemLocal {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  material?: string;
  stone?: string;
  sku: string;
}

interface CartState {
  items: CartItemLocal[];
  isOpen: boolean;
  giftWrap: boolean;
  giftMessage: string;
  discountCode: string | null;
  discountAmount: number;

  addItem: (product: Product, variant?: ProductVariant, media?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setGiftWrap: (value: boolean) => void;
  setGiftMessage: (message: string) => void;
  setDiscount: (code: string | null, amount: number) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      giftWrap: false,
      giftMessage: "",
      discountCode: null,
      discountAmount: 0,

      addItem: (product, variant, media) => {
        const items = get().items;
        const itemId = variant ? `${product.id}-${variant.id}` : product.id;
        const existing = items.find((i) => i.id === itemId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: itemId,
                productId: product.id,
                variantId: variant?.id ?? null,
                name: product.name,
                price: variant?.price_override ?? product.base_price,
                image: media ?? "/placeholder.jpg",
                quantity: 1,
                size: variant?.size ?? undefined,
                material: variant?.material_variant ?? undefined,
                stone: variant?.stone ?? undefined,
                sku: variant?.sku ?? product.sku_prefix,
              },
            ],
          });
        }

        set({ isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({
          items: [],
          giftWrap: false,
          giftMessage: "",
          discountCode: null,
          discountAmount: 0,
        });
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setGiftWrap: (value) => set({ giftWrap: value }),
      setGiftMessage: (message) => set({ giftMessage: message }),
      setDiscount: (code, amount) =>
        set({ discountCode: code, discountAmount: amount }),

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "ishya-cart",
    }
  )
);
