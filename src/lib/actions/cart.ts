"use server";

import { z } from "zod";
import { getCartCrossSell } from "@/lib/queries/storefront";
import type { ProductCardProduct } from "@/components/product/ProductCard";

const inputSchema = z.object({
  productIds: z.array(z.string().uuid()).max(50),
  limit: z.number().int().min(1).max(12).optional(),
});

export async function fetchCartCrossSell(
  input: z.infer<typeof inputSchema>,
): Promise<ProductCardProduct[]> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return [];
  const { productIds, limit } = parsed.data;
  return getCartCrossSell(productIds, limit ?? 4);
}
