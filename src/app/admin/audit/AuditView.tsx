"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, Database } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminAuditLog } from "@/lib/queries/admin";

const ACTION_COLORS: Record<string, string> = {
  insert: "bg-emerald-50 text-emerald-700",
  update: "bg-blue-50 text-blue-700",
  delete: "bg-red-50 text-red-700",
  login: "bg-purple-50 text-purple-700",
  logout: "bg-gray-100 text-gray-600",
};

function actionColor(action: string): string {
  const lower = action.toLowerCase();
  for (const key of Object.keys(ACTION_COLORS)) {
    if (lower.includes(key)) return ACTION_COLORS[key];
  }
  return "bg-gray-100 text-gray-600";
}

export function AuditView({ logs }: { logs: AdminAuditLog[] }) {
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("");

  const tables = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) {
      if (l.tableName) set.add(l.tableName);
    }
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (tableFilter && l.tableName !== tableFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.action.toLowerCase().includes(q) &&
          !(l.tableName ?? "").toLowerCase().includes(q) &&
          !(l.userName ?? "").toLowerCase().includes(q) &&
          !(l.recordId ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [logs, search, tableFilter]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-gray-900">
          Journal d&apos;audit
        </h2>
        <p className="text-sm text-gray-500">
          {logs.length} évènement{logs.length > 1 ? "s" : ""} (200 dernières
          entrées)
        </p>
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
              placeholder="Rechercher (action, table, utilisateur, id)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          {tables.length > 0 && (
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            >
              <option value="">Toutes les tables</option>
              {tables.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400"
        >
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          {logs.length === 0
            ? "Aucune entrée d'audit pour l'instant."
            : "Aucune entrée ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {log.createdAt ? formatDate(log.createdAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          actionColor(log.action),
                        )}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.tableName ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-gray-600">
                          <Database className="w-3 h-3" />
                          {log.tableName}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-400">
                      {log.recordId ? log.recordId.slice(0, 8) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 truncate max-w-[180px]">
                      {log.userName ?? (log.userId ? "Utilisateur supprimé" : "Système")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {log.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
