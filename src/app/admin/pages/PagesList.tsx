"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminCmsPageRow } from "@/lib/queries/admin";

export function PagesList({ pages }: { pages: AdminCmsPageRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  const filtered = useMemo(() => {
    return pages.filter((p) => {
      if (statusFilter === "published" && !p.isPublished) return false;
      if (statusFilter === "draft" && p.isPublished) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.slug.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [pages, search, statusFilter]);

  const publishedCount = pages.filter((p) => p.isPublished).length;

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
          <h2 className="text-xl font-bold text-gray-900">Pages CMS</h2>
          <p className="text-sm text-gray-500">
            {pages.length} page{pages.length > 1 ? "s" : ""} ·
            <span className="text-emerald-600 ml-1">
              {publishedCount} publiée{publishedCount > 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <Link
          href="/admin/pages/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle page
        </Link>
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
              placeholder="Rechercher (titre, slug)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                ["all", "Toutes"],
                ["published", "Publiées"],
                ["draft", "Brouillons"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === key
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400"
        >
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          {pages.length === 0
            ? "Aucune page CMS. Créez-en une pour commencer."
            : "Aucune page ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="divide-y divide-gray-100">
            {filtered.map((page) => (
              <div
                key={page.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="font-medium text-gray-900 hover:text-terracotta transition-colors"
                  >
                    {page.title}
                  </Link>
                  <p className="text-xs text-gray-400 font-mono">
                    /p/{page.slug}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        page.isPublished
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {page.isPublished ? "Publiée" : "Brouillon"}
                    </span>
                    {page.updatedAt && (
                      <span className="text-xs text-gray-400">
                        Mise à jour le {formatDate(page.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {page.isPublished && (
                    <Link
                      href={`/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors"
                      aria-label="Voir la page publique"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
