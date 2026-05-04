// Helpers et types pack — utilisables côté client ET serveur (no server-only)

export type PackDiscountType =
  | "percentage"
  | "fixed_amount"
  | "free_shipping"
  | "buy_x_get_y";

export type PackVariantOption = {
  id: string;
  name: string | null;
  size: string | null;
  color: string | null;
  stone: string | null;
  material_variant: string | null;
  length_cm: number | null;
  price_override: number | null;
  stock_quantity: number;
  sku: string | null;
};

export type PackItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_short_description: string | null;
  base_price: number;
  is_required: boolean;
  sort_order: number;
  image_url: string | null;
  variants: PackVariantOption[];
};

export type PackDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  discount_type: PackDiscountType;
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  items: PackItem[];
  default_subtotal: number;
  default_total: number;
  default_savings: number;
};

export function computePackPrice(
  items: Array<{ price: number; quantity: number }>,
  discountType: PackDiscountType,
  discountValue: number,
): { subtotal: number; total: number; savings: number } {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  let total = subtotal;
  if (discountType === "percentage") {
    total = subtotal * (1 - Math.min(100, Math.max(0, discountValue)) / 100);
  } else if (discountType === "fixed_amount") {
    total = Math.max(0, subtotal - discountValue);
  }
  return {
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(total.toFixed(2)),
    savings: Number((subtotal - total).toFixed(2)),
  };
}
