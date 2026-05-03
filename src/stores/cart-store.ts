import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartProduct = {
  id: string;
  name: string;
  base_price: number;
  sku?: string | null;
};

export type CartVariant = {
  id: string;
  sku?: string | null;
  size?: string | null;
  material_variant?: string | null;
  stone?: string | null;
  price_override?: number | null;
};

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

  addItem: (product: CartProduct, variant?: CartVariant, media?: string) => void;
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

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync(items: CartItemLocal[]) {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const email =
      typeof window !== "undefined"
        ? sessionStorage.getItem("checkout_email")
        : null;
    fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        email,
      }),
    }).catch((err) => {
      // L'échec de sync ne doit pas casser l'UX
      console.warn("[cart-store] sync failed:", err);
    });
  }, 800);
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

        let nextItems: CartItemLocal[];
        if (existing) {
          nextItems = items.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          nextItems = [
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
              sku: variant?.sku ?? product.sku ?? "",
            },
          ];
        }

        set({ items: nextItems, isOpen: true });
        scheduleSync(nextItems);
      },

      removeItem: (id) => {
        const nextItems = get().items.filter((i) => i.id !== id);
        set({ items: nextItems });
        scheduleSync(nextItems);
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const nextItems = get().items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        );
        set({ items: nextItems });
        scheduleSync(nextItems);
      },

      clearCart: () => {
        set({
          items: [],
          giftWrap: false,
          giftMessage: "",
          discountCode: null,
          discountAmount: 0,
        });
        scheduleSync([]);
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
