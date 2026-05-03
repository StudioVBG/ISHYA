"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Eye, Download } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminClientRow } from "@/lib/queries/admin";

const tierConfig: Record<string, { label: string; className: string }> = {
  bronze: { label: "Bronze", className: "bg-amber-100 text-amber-800" },
  silver: { label: "Argent", className: "bg-gray-200 text-gray-700" },
  gold: { label: "Or", className: "bg-gold/20 text-gold-dark" },
  platinum: { label: "Platine", className: "bg-purple-100 text-purple-700" },
};

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
          <h2 className="text-xl font-bold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500">
            {clients.length} client{clients.length > 1 ? "s" : ""} inscrit
            {clients.length > 1 ? "s" : ""}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
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
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CA total
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fidélité
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                    className="px-4 py-12 text-center text-gray-400"
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
                    className: "bg-gray-100 text-gray-700",
                  };
                  const fullName =
                    [client.firstName, client.lastName]
                      .filter(Boolean)
                      .join(" ") || "Client sans nom";
                  return (
                    <tr
                      key={client.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="font-medium text-gray-900 hover:text-terracotta transition-colors"
                          >
                            {fullName}
                          </Link>
                          <p className="text-xs text-gray-400">
                            {client.email ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {client.ordersCount}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
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
                      <td className="px-4 py-3 text-gray-500">
                        {client.createdAt
                          ? formatDate(client.createdAt)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors inline-block"
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
