"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, Database } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminAuditLog } from "@/lib/queries/admin";

const ACTION_COLORS: Record<string, string> = {
  insert: "bg-success-soft text-success",
  update: "bg-info-soft text-info",
  delete: "bg-destructive-soft text-destructive",
  login: "bg-accent-purple-soft text-accent-purple",
  logout: "bg-muted-soft text-muted",
};

function actionColor(action: string): string {
  const lower = action.toLowerCase();
  for (const key of Object.keys(ACTION_COLORS)) {
    if (lower.includes(key)) return ACTION_COLORS[key];
  }
  return "bg-muted-soft text-muted";
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
        <h2 className="text-xl font-bold text-foreground">
          Journal d&apos;audit
        </h2>
        <p className="text-sm text-muted">
          {logs.length} évènement{logs.length > 1 ? "s" : ""} (200 dernières
          entrées)
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
            <input
              type="text"
              placeholder="Rechercher (action, table, utilisateur, id)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          {tables.length > 0 && (
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
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
          className="bg-white rounded-xl border border-border p-12 text-center text-muted-light"
        >
          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-light" />
          {logs.length === 0
            ? "Aucune entrée d'audit pour l'instant."
            : "Aucune entrée ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted-soft/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
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
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-muted">
                          <Database className="w-3 h-3" />
                          {log.tableName}
                        </span>
                      ) : (
                        <span className="text-muted-light">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-muted-light">
                      {log.recordId ? log.recordId.slice(0, 8) : "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground truncate max-w-[180px]">
                      {log.userName ?? (log.userId ? "Utilisateur supprimé" : "Système")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
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
