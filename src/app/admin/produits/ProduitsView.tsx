"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  Package,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminProductRow } from "@/lib/queries/admin";
import { deleteProduct, deleteProducts } from "./actions";

export function ProduitsView({ products }: { products: AdminProductRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [bulkDeleting, setBulkDeleting] = useState<string[] | null>(null);

  const handleDeleteOne = (id: string, name: string) => {
    setDeleting({ id, name });
  };

  const handleConfirmDeleteOne = () => {
    if (!deleting) return;
    const id = deleting.id;
    startDeleteTransition(async () => {
      const res = await deleteProduct(id);
      // deleteProduct fait un redirect() : si res est undefined la suppression a réussi.
      if (res && !res.ok) {
        toast.error(res.error ?? "Erreur de suppression");
        setDeleting(null);
        return;
      }
      toast.success("Produit supprimé");
      setDeleting(null);
    });
  };

  const handleDeleteSelected = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleting(ids);
  };

  const handleConfirmBulkDelete = () => {
    if (!bulkDeleting || bulkDeleting.length === 0) return;
    const ids = bulkDeleting;
    startDeleteTransition(async () => {
      const res = await deleteProducts(ids);
      setBulkDeleting(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur de suppression");
        return;
      }
      toast.success(
        `${res.deleted ?? ids.length} produit${(res.deleted ?? ids.length) > 1 ? "s supprimés" : " supprimé"}`,
      );
      setRowSelection({});
    });
  };

  const filteredData = useMemo(() => {
    let data = products;
    if (categoryFilter) data = data.filter((p) => p.category === categoryFilter);
    if (statusFilter)
      data = data.filter((p) =>
        statusFilter === "active" ? p.isActive : !p.isActive,
      );
    return data;
  }, [products, categoryFilter, statusFilter]);

  const columns = useMemo<ColumnDef<AdminProductRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-border"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-border"
          />
        ),
        size: 40,
      },
      {
        accessorKey: "imageUrl",
        header: "",
        cell: ({ row }) => {
          const url = row.original.imageUrl;
          return url ? (
            <Image
              src={url}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-bone-soft flex items-center justify-center">
              <Package className="w-4 h-4 text-steel-soft" />
            </div>
          );
        },
        size: 56,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Nom",
        cell: ({ row }) => (
          <Link
            href={`/admin/produits/${row.original.id}`}
            className="font-medium text-foreground hover:text-ember transition-colors"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-steel">
            {getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "basePrice",
        header: "Prix",
        cell: ({ getValue }) => (
          <span className="font-medium">{formatPrice(getValue<number>())}</span>
        ),
      },
      {
        accessorKey: "totalStock",
        header: "Stock",
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return (
            <span
              className={cn(
                "font-medium",
                v === 0
                  ? "text-destructive"
                  : v < 10
                    ? "text-warning"
                    : "text-foreground",
              )}
            >
              {v}
            </span>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Catégorie",
        cell: ({ getValue }) => getValue<string | null>() ?? "—",
      },
      {
        accessorKey: "isActive",
        header: "Statut",
        cell: ({ getValue }) => {
          const active = getValue<boolean>();
          return (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                active
                  ? "bg-success-soft text-success"
                  : "bg-bone-soft text-steel",
              )}
            >
              {active ? "Actif" : "Brouillon"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/produits/${row.original.id}`}
              className="p-1.5 rounded-lg hover:bg-bone-soft text-steel hover:text-ember transition-colors"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() =>
                handleDeleteOne(row.original.id, row.original.name)
              }
              disabled={isDeletePending}
              className="p-1.5 rounded-lg hover:bg-bone-soft text-steel hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Supprimer ${row.original.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        size: 80,
      },
    ],
    [isDeletePending],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const selectedCount = Object.keys(rowSelection).length;
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => !!c)),
  );

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
          <h2 className="text-xl font-bold text-foreground">Produits</h2>
          <p className="text-sm text-steel">
            {products.length} produit{products.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ember text-white rounded-lg font-medium text-sm hover:bg-ember-deep transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </Link>
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
              placeholder="Rechercher un produit..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
          >
            <option value="">Tous statuts</option>
            <option value="active">Actif</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
            <span className="text-sm text-steel">
              {selectedCount} sélectionné(s)
            </span>
            <button
              type="button"
              onClick={() =>
                handleDeleteSelected(
                  table
                    .getSelectedRowModel()
                    .rows.map((r) => r.original.id),
                )
              }
              disabled={isDeletePending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-destructive bg-destructive-soft rounded-lg hover:bg-destructive/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeletePending ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border bg-bone-soft/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none hover:text-ink",
                      )}
                      style={{
                        width:
                          header.getSize() !== 150 ? header.getSize() : undefined,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ChevronUp className="w-3.5 h-3.5" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-steel-soft"
                  >
                    {products.length === 0
                      ? "Aucun produit. Créez-en un pour commencer."
                      : "Aucun produit ne correspond à votre recherche."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/40 last:border-0 hover:bg-bone-soft/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Supprimer définitivement ce produit ?"
        description={
          deleting
            ? `« ${deleting.name} » sera supprimé. Les variantes, photos et appartenances aux catégories/collections/packs seront aussi effacées.`
            : undefined
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={isDeletePending}
        onConfirm={handleConfirmDeleteOne}
      />

      <ConfirmDialog
        open={bulkDeleting !== null}
        onOpenChange={(open) => {
          if (!open) setBulkDeleting(null);
        }}
        title={
          bulkDeleting && bulkDeleting.length > 1
            ? `Supprimer ${bulkDeleting.length} produits ?`
            : "Supprimer ce produit ?"
        }
        description="Cette action est irréversible. Les variantes, photos et appartenances seront aussi effacées."
        confirmLabel={
          bulkDeleting && bulkDeleting.length > 1
            ? `Supprimer ${bulkDeleting.length} produits`
            : "Supprimer"
        }
        tone="destructive"
        pending={isDeletePending}
        onConfirm={handleConfirmBulkDelete}
      />
    </motion.div>
  );
}
