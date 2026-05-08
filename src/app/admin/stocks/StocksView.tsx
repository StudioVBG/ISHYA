"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminVariantStockRow } from "@/lib/queries/admin";
import { updateVariantStock } from "./actions";

function getStockStatus(stock: number, threshold: number) {
  if (stock === 0)
    return {
      label: "Rupture",
      className: "bg-destructive-soft text-destructive",
      dotColor: "bg-destructive",
    };
  if (stock <= threshold)
    return {
      label: "Stock bas",
      className: "bg-warning-soft text-warning",
      dotColor: "bg-warning",
    };
  return {
    label: "OK",
    className: "bg-success-soft text-success",
    dotColor: "bg-success",
  };
}

export function StocksView({ rows }: { rows: AdminVariantStockRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ok" | "low" | "out"
  >("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = rows.filter((s) => {
    if (
      search &&
      !s.productName.toLowerCase().includes(search.toLowerCase()) &&
      !(s.sku ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter === "ok" && (s.quantity === 0 || s.quantity <= s.threshold))
      return false;
    if (statusFilter === "low" && (s.quantity === 0 || s.quantity > s.threshold))
      return false;
    if (statusFilter === "out" && s.quantity !== 0) return false;
    return true;
  });

  const outCount = rows.filter((s) => s.quantity === 0).length;
  const lowCount = rows.filter(
    (s) => s.quantity > 0 && s.quantity <= s.threshold,
  ).length;

  function saveEdit(variantId: string) {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) {
      toast.error("Quantité invalide");
      setEditingId(null);
      return;
    }
    startTransition(async () => {
      const res = await updateVariantStock(variantId, val);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur de mise à jour");
        return;
      }
      toast.success("Stock mis à jour");
      setEditingId(null);
    });
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Gestion des stocks
          </h2>
          <p className="text-sm text-steel">
            {rows.length} variante{rows.length > 1 ? "s" : ""} ·
            <span className="text-destructive ml-1">
              {outCount} en rupture
            </span>{" "}
            ·
            <span className="text-warning ml-1">
              {lowCount} stock bas
            </span>
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-soft" />
            <input
              type="text"
              placeholder="Rechercher produit ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                ["all", "Tous"],
                ["ok", "OK"],
                ["low", "Stock bas"],
                ["out", "Rupture"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === key
                    ? "bg-foreground text-white"
                    : "bg-white border border-border text-steel hover:bg-bone-soft",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bone-soft/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Variante
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Seuil
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-steel-soft"
                  >
                    {rows.length === 0
                      ? "Aucune variante en base."
                      : "Aucune variante ne correspond à votre recherche."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const status = getStockStatus(row.quantity, row.threshold);
                  const isEditing = editingId === row.variantId;
                  return (
                    <tr
                      key={row.variantId}
                      className={cn(
                        "border-b border-border/40 last:border-0 transition-colors",
                        row.quantity === 0
                          ? "bg-destructive-soft/30"
                          : row.quantity <= row.threshold
                            ? "bg-warning-soft/30"
                            : "hover:bg-bone-soft/50",
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.productName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-steel">
                        {row.sku ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-steel">
                        {row.variantLabel}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-16 px-2 py-1 border border-border rounded text-center text-sm focus:outline-none focus:border-ember"
                              autoFocus
                              onKeyDown={(e) =>
                                e.key === "Enter" && saveEdit(row.variantId)
                              }
                              disabled={isPending}
                            />
                            <button
                              onClick={() => saveEdit(row.variantId)}
                              disabled={isPending}
                              className="p-1 rounded bg-success-soft text-success hover:bg-success-soft disabled:opacity-50"
                            >
                              {isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(row.variantId);
                              setEditValue(String(row.quantity));
                            }}
                            className={cn(
                              "font-bold tabular-nums hover:underline",
                              row.quantity === 0
                                ? "text-destructive"
                                : row.quantity <= row.threshold
                                  ? "text-warning"
                                  : "text-foreground",
                            )}
                          >
                            {row.quantity}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-steel-soft">
                        {row.threshold}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                            status.className,
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              status.dotColor,
                            )}
                          />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
