"use client";

import Link from "next/link";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Package, Trash2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export interface SortableProductItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  productSku: string | null;
  basePrice: number;
  isActive: boolean;
}

interface Props {
  item: SortableProductItem;
  isPending: boolean;
  onRemove: (productId: string) => void;
}

export function SortableProductRow({ item, isPending, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.productId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-white transition-shadow",
        isDragging
          ? "border-terracotta shadow-lg z-10 relative"
          : "border-border",
      )}
    >
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
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-muted tabular-nums">
            {formatPrice(item.basePrice)}
          </span>
          {!item.isActive && (
            <span className="px-1.5 py-0.5 rounded bg-muted-soft text-[10px] uppercase tracking-wide font-medium text-muted">
              Inactif
            </span>
          )}
          {item.productSku && (
            <span className="text-[10px] text-muted-light font-mono truncate">
              {item.productSku}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        disabled={isPending}
        aria-label={`Retirer ${item.productName} de la catégorie`}
        className="shrink-0 p-2 rounded-lg hover:bg-destructive-soft text-muted-light hover:text-destructive transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
