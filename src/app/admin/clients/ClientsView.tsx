"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Eye, Download } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminClientRow } from "@/lib/queries/admin";

const tierConfig: Record<string, { label: string; className: string }> = {
  bronze: { label: "Bronze", className: "bg-warning-soft text-warning" },
  silver: { label: "Argent", className: "bg-border text-foreground" },
  gold: { label: "Or", className: "bg-ember/20 text-ember-deep" },
  platinum: { label: "Platine", className: "bg-accent-purple-soft text-accent-purple" },
};

function exportClientsCsv(rows: AdminClientRow[]) {
  const header = [
    "first_name",
    "last_name",
    "email",
    "loyalty_tier",
    "orders_count",
    "total_spent",
    "created_at",
  ];
  const lines = [
    header.join(","),
    ...rows.map((c) =>
      [
        c.firstName ?? "",
        c.lastName ?? "",
        c.email ?? "",
        c.loyaltyTier,
        c.ordersCount,
        c.totalSpent,
        c.createdAt ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ClientsView({ clients }: { clients: AdminClientRow[] }) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (tierFilter && c.loyaltyTier !== tierFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const fullName = [c.firstName, c.lastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (
          !fullName.includes(q) &&
          !(c.email ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [clients, search, tierFilter]);

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
          <h2 className="text-xl font-bold text-foreground">Clients</h2>
          <p className="text-sm text-steel">
            {clients.length} client{clients.length > 1 ? "s" : ""} inscrit
            {clients.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportClientsCsv(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg font-medium text-sm text-foreground hover:bg-bone-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
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
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
          >
            <option value="">Tous niveaux</option>
            {Object.entries(tierConfig).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
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
                  Client
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-steel uppercase tracking-wider">
                  CA total
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-steel uppercase tracking-wider">
                  Fidélité
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-steel-soft"
                  >
                    {clients.length === 0
                      ? "Aucun client inscrit."
                      : "Aucun client ne correspond à votre recherche."}
                  </td>
                </tr>
              ) : (
                filtered.map((client) => {
                  const t = tierConfig[client.loyaltyTier] ?? {
                    label: client.loyaltyTier,
                    className: "bg-bone-soft text-foreground",
                  };
                  const fullName =
                    [client.firstName, client.lastName]
                      .filter(Boolean)
                      .join(" ") || "Client sans nom";
                  return (
                    <tr
                      key={client.id}
                      className="border-b border-border/40 last:border-0 hover:bg-bone-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="font-medium text-foreground hover:text-ember transition-colors"
                          >
                            {fullName}
                          </Link>
                          <p className="text-xs text-steel-soft">
                            {client.email ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-steel">
                        {client.ordersCount}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatPrice(client.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            t.className,
                          )}
                        >
                          {t.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-steel">
                        {client.createdAt
                          ? formatDate(client.createdAt)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="p-1.5 rounded-lg hover:bg-bone-soft text-steel hover:text-ember transition-colors inline-block"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
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
