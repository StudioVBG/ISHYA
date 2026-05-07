"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Loader2,
  Package,
  Settings2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AdminPackVariantOption } from "@/lib/queries/admin";
import { setPackItemVariantOptions } from "../actions";

export interface PackItemSortable {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  isRequired: boolean;
  availableVariants: Array<{
    id: string;
    name: string | null;
    sku: string | null;
    isActive: boolean;
  }>;
  variantOptions: AdminPackVariantOption[];
}

interface Props {
  packId: string;
  item: PackItemSortable;
  isPending: boolean;
  variantsOpen: boolean;
  onToggleRequired: (id: string, current: boolean) => void;
  onToggleVariants: (id: string) => void;
  onRemove: (id: string) => void;
  onVariantsSaved: (
    packItemId: string,
    options: AdminPackVariantOption[],
  ) => void;
}

export function SortablePackItemRow({
  packId,
  item,
  isPending,
  variantsOpen,
  onToggleRequired,
  onToggleVariants,
  onRemove,
  onVariantsSaved,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasVariants = item.availableVariants.length > 0;
  const optionCount = item.variantOptions.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-white overflow-hidden transition-shadow",
        isDragging
          ? "border-terracotta shadow-lg z-10 relative"
          : "border-border",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Réordonner ${item.productName}`}
          className="shrink-0 p-1.5 -ml-1 rounded-lg text-muted-light hover:text-foreground hover:bg-muted-soft transition-colors cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="relative w-20 h-20 rounded-lg bg-muted-soft overflow-hidden shrink-0">
          {item.productImageUrl ? (
            <Image
              src={item.productImageUrl}
              alt={item.productName}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-7 h-7 text-muted-light" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/produits/${item.productId}`}
            className="font-medium text-sm text-foreground hover:text-terracotta transition-colors truncate block"
          >
            {item.productName}
          </Link>
          <p className="text-xs text-muted-light font-mono truncate">
            /{item.productSlug}
          </p>
        </div>

        <label className="hidden md:inline-flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={item.isRequired}
            onChange={() => onToggleRequired(item.id, item.isRequired)}
            disabled={isPending}
            className="rounded accent-terracotta"
          />
          Obligatoire
        </label>

        {hasVariants && (
          <button
            type="button"
            onClick={() => onToggleVariants(item.id)}
            aria-label="Configurer les variantes proposées"
            aria-expanded={variantsOpen}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors",
              variantsOpen
                ? "bg-terracotta/10 text-terracotta"
                : "hover:bg-muted-soft text-muted",
            )}
            title="Configurer les variantes proposées"
          >
            <Settings2 className="w-4 h-4" />
            {optionCount === 0
              ? "Toutes"
              : `${optionCount}/${item.availableVariants.length}`}
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={isPending}
          aria-label={`Retirer ${item.productName} du pack`}
          className="shrink-0 p-2 rounded-lg hover:bg-destructive-soft text-muted-light hover:text-destructive transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {hasVariants && variantsOpen && (
        <VariantOptionsPanel
          packId={packId}
          packItemId={item.id}
          availableVariants={item.availableVariants}
          initialOptions={item.variantOptions}
          onSaved={(options) => onVariantsSaved(item.id, options)}
        />
      )}
    </div>
  );
}

interface VariantOptionsPanelProps {
  packId: string;
  packItemId: string;
  availableVariants: PackItemSortable["availableVariants"];
  initialOptions: AdminPackVariantOption[];
  onSaved: (options: AdminPackVariantOption[]) => void;
}

function VariantOptionsPanel({
  packId,
  packItemId,
  availableVariants,
  initialOptions,
  onSaved,
}: VariantOptionsPanelProps) {
  const [draft, setDraft] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const o of initialOptions) map.set(o.variantId, o.priceAdjustment);
    return map;
  });
  const [isSaving, startTransition] = useTransition();

  const toggle = (variantId: string) => {
    setDraft((prev) => {
      const next = new Map(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.set(variantId, 0);
      return next;
    });
  };

  const setAdjustment = (variantId: string, value: number) => {
    setDraft((prev) => {
      const next = new Map(prev);
      next.set(variantId, value);
      return next;
    });
  };

  const handleSave = () => {
    const options = Array.from(draft.entries()).map(
      ([variantId, priceAdjustment]) => ({ variantId, priceAdjustment }),
    );
    startTransition(async () => {
      const res = await setPackItemVariantOptions(
        packId,
        packItemId,
        options,
      );
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(
        options.length === 0
          ? "Toutes les variantes seront proposées"
          : `${options.length} variante${options.length > 1 ? "s" : ""} configurée${options.length > 1 ? "s" : ""}`,
      );
      onSaved(options);
    });
  };

  return (
    <div className="border-t border-border bg-muted-soft/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-foreground">
            Variantes proposées en boutique
          </p>
          <p className="text-xs text-muted-light mt-0.5">
            Aucune coche = toutes les variantes du produit sont proposées. Le
            réajustement (€) s&apos;ajoute au prix de base du pack pour cette
            variante uniquement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft(new Map())}
          disabled={isSaving || draft.size === 0}
          className="text-xs text-muted hover:text-terracotta disabled:opacity-40 shrink-0"
        >
          Tout décocher
        </button>
      </div>
      <div className="space-y-1.5">
        {availableVariants.map((v) => {
          const checked = draft.has(v.id);
          const adjustment = draft.get(v.id) ?? 0;
          return (
            <div key={v.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(v.id)}
                disabled={isSaving}
                className="rounded accent-terracotta"
              />
              <div className="flex-1 min-w-0">
                <span className="text-foreground">
                  {v.name ?? v.sku ?? v.id.slice(0, 8)}
                </span>
                {v.sku && v.name && (
                  <span className="text-xs text-muted-light font-mono ml-2">
                    {v.sku}
                  </span>
                )}
                {!v.isActive && (
                  <span className="ml-2 text-xs text-muted-light italic">
                    (inactive)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-light">±</span>
                <input
                  type="number"
                  step="0.01"
                  value={adjustment}
                  onChange={(e) =>
                    setAdjustment(v.id, Number(e.target.value) || 0)
                  }
                  disabled={!checked || isSaving}
                  className="w-20 px-2 py-1 border border-border rounded text-xs text-right disabled:opacity-40 disabled:bg-muted-soft"
                />
                <span className="text-xs text-muted-light">€</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terracotta text-white rounded-lg text-xs font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Enregistrer les variantes
        </button>
      </div>
    </div>
  );
}
