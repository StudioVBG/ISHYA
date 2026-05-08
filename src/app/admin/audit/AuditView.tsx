"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Database,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type {
  AdminAuditFilters,
  AdminAuditLog,
  AdminAuditPage,
} from "@/lib/queries/admin";

const ACTION_COLORS: Record<string, string> = {
  insert: "bg-success-soft text-success",
  update: "bg-info-soft text-info",
  delete: "bg-destructive-soft text-destructive",
  login: "bg-accent-purple-soft text-accent-purple",
  logout: "bg-bone-soft text-steel",
};

function actionColor(action: string): string {
  const lower = action.toLowerCase();
  for (const key of Object.keys(ACTION_COLORS)) {
    if (lower.includes(key)) return ACTION_COLORS[key];
  }
  return "bg-bone-soft text-steel";
}

function buildHref(
  base: string,
  params: Record<string, string | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export function AuditView({
  data,
  filters,
}: {
  data: AdminAuditPage;
  filters: AdminAuditFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerLog, setDrawerLog] = useState<AdminAuditLog | null>(null);

  // Form state local pour ne pas re-fetch à chaque keystroke
  const [search, setSearch] = useState(filters.search ?? "");
  const [action, setAction] = useState(filters.action ?? "");
  const [table, setTable] = useState(filters.tableName ?? "");
  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(filters.dateTo ?? "");

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (search.trim()) sp.set("search", search.trim());
    if (action) sp.set("action", action);
    if (table) sp.set("table", table);
    if (dateFrom) sp.set("from", dateFrom);
    if (dateTo) sp.set("to", dateTo);
    // Reset page lors d'un changement de filtre
    router.push(`/admin/audit${sp.toString() ? `?${sp.toString()}` : ""}`);
  };

  const resetFilters = () => {
    setSearch("");
    setAction("");
    setTable("");
    setDateFrom("");
    setDateTo("");
    router.push("/admin/audit");
  };

  const buildPageHref = (p: number) =>
    buildHref("/admin/audit", {
      ...Object.fromEntries(searchParams.entries()),
      page: String(p),
    });

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
        <p className="text-sm text-steel">
          {data.total} évènement{data.total > 1 ? "s" : ""} au total — page{" "}
          {data.page} / {totalPages}
        </p>
      </motion.div>

      <motion.form
        variants={staggerItem}
        onSubmit={applyFilters}
        className="bg-white rounded-xl border border-border p-4 space-y-3"
      >
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-soft" />
            <input
              type="text"
              placeholder="Rechercher (action, table, ID enregistrement)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
              aria-label="Rechercher dans les logs d'audit"
            />
          </div>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 sm:min-w-[140px]"
            aria-label="Filtrer par action"
          >
            <option value="">Toutes les actions</option>
            {data.knownActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 sm:min-w-[180px]"
            aria-label="Filtrer par table"
          >
            <option value="">Toutes les tables</option>
            {data.knownTables.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Du
            </label>
            <input
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Au
            </label>
            <input
              type="datetime-local"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20"
            />
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-bone-soft transition-colors"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ember text-white rounded-lg text-sm font-medium hover:bg-ember-deep transition-colors"
            >
              <Filter className="w-4 h-4" />
              Appliquer
            </button>
          </div>
        </div>
      </motion.form>

      {data.logs.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-12 text-center text-steel-soft"
        >
          <FileText className="w-8 h-8 mx-auto mb-2 text-steel-soft" />
          {data.total === 0
            ? "Aucune entrée d'audit pour l'instant."
            : "Aucune entrée ne correspond à vos filtres."}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bone-soft/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-steel uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setDrawerLog(log)}
                    className="border-b border-border/40 last:border-0 hover:bg-bone-soft/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-steel whitespace-nowrap">
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
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-steel">
                          <Database className="w-3 h-3" />
                          {log.tableName}
                        </span>
                      ) : (
                        <span className="text-steel-soft">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-steel-soft">
                      <span title={log.recordId ?? ""}>
                        {log.recordId ? log.recordId.slice(0, 8) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground truncate max-w-[180px]">
                      <span title={log.userName ?? log.userId ?? ""}>
                        {log.userName ??
                          (log.userId ? "Utilisateur supprimé" : "Système")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-steel">
                      {log.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bone-soft/30">
              <p className="text-xs text-steel">
                Affichage {(data.page - 1) * data.pageSize + 1} –{" "}
                {Math.min(data.page * data.pageSize, data.total)} sur{" "}
                {data.total}
              </p>
              <div className="flex items-center gap-2">
                {data.page > 1 ? (
                  <Link
                    href={buildPageHref(data.page - 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3" /> Précédent
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-steel-soft opacity-40">
                    <ChevronLeft className="w-3 h-3" /> Précédent
                  </span>
                )}
                <span className="text-xs text-steel px-2">
                  Page {data.page} / {totalPages}
                </span>
                {data.hasNext ? (
                  <Link
                    href={buildPageHref(data.page + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-white transition-colors"
                  >
                    Suivant <ChevronRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-steel-soft opacity-40">
                    Suivant <ChevronRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {drawerLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setDrawerLog(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="audit-drawer-title"
            >
              <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
                <h2
                  id="audit-drawer-title"
                  className="text-base font-semibold text-foreground inline-flex items-center gap-2"
                >
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      actionColor(drawerLog.action),
                    )}
                  >
                    {drawerLog.action}
                  </span>
                  {drawerLog.tableName && (
                    <span className="font-mono text-sm text-steel">
                      {drawerLog.tableName}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => setDrawerLog(null)}
                  aria-label="Fermer"
                  className="p-1.5 rounded-lg hover:bg-bone-soft text-steel transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-sm">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Date
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerLog.createdAt
                        ? formatDate(drawerLog.createdAt)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      ID enregistrement
                    </dt>
                    <dd className="text-foreground font-mono text-xs mt-0.5 break-all">
                      {drawerLog.recordId ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      Utilisateur
                    </dt>
                    <dd className="text-foreground mt-0.5">
                      {drawerLog.userName ??
                        (drawerLog.userId ? "Utilisateur supprimé" : "Système")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-steel uppercase tracking-wider">
                      IP
                    </dt>
                    <dd className="text-foreground font-mono text-xs mt-0.5">
                      {drawerLog.ipAddress ?? "—"}
                    </dd>
                  </div>
                </dl>

                <div>
                  <h3 className="text-xs font-semibold text-steel uppercase tracking-wider mb-2">
                    Avant
                  </h3>
                  <pre className="bg-bone-soft rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                    {drawerLog.oldData
                      ? JSON.stringify(drawerLog.oldData, null, 2)
                      : "— (création ou pas de snapshot avant)"}
                  </pre>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-steel uppercase tracking-wider mb-2">
                    Après
                  </h3>
                  <pre className="bg-bone-soft rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                    {drawerLog.newData
                      ? JSON.stringify(drawerLog.newData, null, 2)
                      : "— (suppression ou pas de snapshot après)"}
                  </pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
