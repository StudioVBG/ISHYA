"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, ShoppingBag, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { useCartStore } from "@/stores/cart-store";
import {
  computePackPrice,
  type PackDetail,
  type PackVariantOption,
} from "@/lib/pack-pricing";

type SelectionMap = Record<string, string | null>; // pack_item.id → variant.id | null

function discountLabel(p: PackDetail): string | null {
  switch (p.discount_type) {
    case "percentage":
      return p.discount_value > 0 ? `-${p.discount_value}%` : null;
    case "fixed_amount":
      return p.discount_value > 0 ? `-${formatPrice(p.discount_value)}` : null;
    case "free_shipping":
      return "Livraison offerte";
    case "buy_x_get_y":
      return "Offre X+Y";
  }
}

export function PackPageClient({ pack }: { pack: PackDetail }) {
  const addPackToCart = useCartStore((s) => s.addPackToCart);

  // Sélection initiale : 1ère variante de chaque item (si disponible)
  const [selection, setSelection] = useState<SelectionMap>(() => {
    const init: SelectionMap = {};
    for (const it of pack.items) {
      init[it.id] = it.variants[0]?.id ?? null;
    }
    return init;
  });

  // Calcul de prix dynamique
  const priced = useMemo(() => {
    const lines = pack.items.map((it) => {
      const chosen = it.variants.find((v) => v.id === selection[it.id]);
      const price = chosen?.price_override ?? it.base_price;
      return { price, quantity: 1 };
    });
    return computePackPrice(lines, pack.discount_type, pack.discount_value);
  }, [pack, selection]);

  // Disponibilité globale du pack
  const allItemsHaveStock = pack.items.every((it) => {
    const chosen = it.variants.find((v) => v.id === selection[it.id]);
    if (!it.is_required) return true;
    if (it.variants.length === 0) return false; // pas de variante = produit indisponible
    return (chosen?.stock_quantity ?? 0) > 0;
  });

  const handleAddToCart = () => {
    const lines = pack.items
      .map((it) => {
        const chosen = it.variants.find((v) => v.id === selection[it.id]);
        // si l'item est optionnel ET non choisi → on saute
        if (!chosen && !it.is_required) return null;
        const basePrice = chosen?.price_override ?? it.base_price;
        // distribute pack discount proportionnellement
        const ratio =
          priced.subtotal > 0 ? priced.total / priced.subtotal : 1;
        return {
          product: {
            id: it.product_id,
            name: it.product_name,
            base_price: it.base_price,
            sku: chosen?.sku ?? null,
          },
          variant: chosen
            ? {
                id: chosen.id,
                sku: chosen.sku,
                size: chosen.size,
                material_variant: chosen.material_variant,
                stone: chosen.stone,
                price_override: chosen.price_override,
              }
            : undefined,
          media: it.image_url ?? undefined,
          unitPrice: Number((basePrice * ratio).toFixed(2)),
          quantity: 1,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (lines.length === 0) {
      toast.error("Sélectionnez au moins un produit");
      return;
    }

    addPackToCart(pack.id, pack.name, lines);
    toast.success(
      priced.savings > 0
        ? `Pack ajouté · économie ${formatPrice(priced.savings)}`
        : "Pack ajouté",
    );
  };

  const setVariant = (itemId: string, variantId: string | null) => {
    setSelection((prev) => ({ ...prev, [itemId]: variantId }));
  };

  const badge = discountLabel(pack);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="border-b border-border px-4">
        <div className="container py-3 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-terracotta transition-colors">
            Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/boutique"
            className="hover:text-terracotta transition-colors"
          >
            Boutique
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate">
            Pack · {pack.name}
          </span>
        </div>
      </nav>

      <section className="py-8 md:py-12 px-4">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Visual */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-beige-nude-light">
                {pack.image_url ? (
                  <Image
                    src={pack.image_url}
                    alt={pack.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted/40" />
                  </div>
                )}
                {badge && (
                  <span className="absolute top-4 left-4 bg-destructive text-white text-xs font-medium px-3 py-1 rounded">
                    {badge}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.p
                variants={fadeInUp}
                className="text-xs text-muted uppercase tracking-wider mb-2 inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                Pack
              </motion.p>
              <motion.h1
                variants={fadeInUp}
                className="font-display text-3xl md:text-4xl mb-3"
              >
                {pack.name}
              </motion.h1>

              {pack.description && (
                <motion.p
                  variants={fadeInUp}
                  className="text-muted leading-relaxed mb-6"
                >
                  {pack.description}
                </motion.p>
              )}

              {/* Pricing */}
              <motion.div
                variants={fadeInUp}
                className="flex items-baseline gap-3 mb-2"
              >
                <span
                  className={cn(
                    "text-2xl font-medium",
                    priced.savings > 0 && "text-terracotta",
                  )}
                >
                  {formatPrice(priced.total)}
                </span>
                {priced.savings > 0 && (
                  <span className="text-lg text-muted line-through">
                    {formatPrice(priced.subtotal)}
                  </span>
                )}
              </motion.div>
              {priced.savings > 0 && (
                <motion.p
                  variants={fadeInUp}
                  className="text-sm text-success mb-6"
                >
                  Vous économisez {formatPrice(priced.savings)}
                </motion.p>
              )}

              {/* Items list with variant selection */}
              <motion.div variants={fadeInUp} className="space-y-3 mb-6">
                {pack.items.map((it) => (
                  <PackItemRow
                    key={it.id}
                    item={it}
                    selectedVariantId={selection[it.id] ?? null}
                    onSelect={(vid) => setVariant(it.id, vid)}
                  />
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div variants={fadeInUp} className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!allItemsHaveStock}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {allItemsHaveStock
                    ? "Ajouter le pack au panier"
                    : "Pack indisponible"}
                </button>
              </motion.div>

              {pack.starts_at || pack.ends_at ? (
                <motion.p
                  variants={fadeInUp}
                  className="text-xs text-muted mt-4"
                >
                  {pack.starts_at && (
                    <span>
                      Disponible à partir du{" "}
                      {new Date(pack.starts_at).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  {pack.ends_at && (
                    <span>
                      {" "}
                      jusqu&apos;au{" "}
                      {new Date(pack.ends_at).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </motion.p>
              ) : null}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

function PackItemRow({
  item,
  selectedVariantId,
  onSelect,
}: {
  item: PackDetail["items"][number];
  selectedVariantId: string | null;
  onSelect: (variantId: string | null) => void;
}) {
  const chosen = item.variants.find(
    (v: PackVariantOption) => v.id === selectedVariantId,
  );
  const lineSubtitle = chosen
    ? [chosen.size, chosen.material_variant, chosen.color, chosen.stone]
        .filter(Boolean)
        .join(" · ")
    : null;
  const linePrice = chosen?.price_override ?? item.base_price;

  return (
    <motion.div
      variants={staggerItem}
      className="flex items-start gap-3 p-3 border border-border rounded-lg"
    >
      <div className="w-14 h-14 rounded-lg bg-beige-nude-light overflow-hidden shrink-0 relative">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.product_name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-muted/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            href={`/produit/${item.product_slug}`}
            className="font-medium text-sm text-foreground hover:text-terracotta transition-colors truncate"
          >
            {item.product_name}
          </Link>
          <span className="text-sm tabular-nums text-muted shrink-0">
            {formatPrice(linePrice)}
          </span>
        </div>
        {lineSubtitle && (
          <p className="text-xs text-muted">{lineSubtitle}</p>
        )}
        {item.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.variants.map((v) => {
              const out = v.stock_quantity === 0;
              const active = v.id === selectedVariantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelect(v.id)}
                  disabled={out}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs border transition-colors",
                    active
                      ? "border-terracotta bg-terracotta/5 text-terracotta"
                      : "border-border hover:border-terracotta-light",
                    out && "opacity-50 line-through cursor-not-allowed",
                  )}
                >
                  {v.size ?? v.material_variant ?? v.color ?? v.sku ?? "—"}
                </button>
              );
            })}
          </div>
        )}
        {!item.is_required && (
          <button
            type="button"
            onClick={() => onSelect(selectedVariantId ? null : item.variants[0]?.id ?? null)}
            className="text-[11px] text-muted hover:text-terracotta mt-1 underline"
          >
            {selectedVariantId ? "Retirer du pack" : "Inclure dans le pack"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
