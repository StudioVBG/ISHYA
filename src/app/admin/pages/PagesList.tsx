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
          <h2 className="text-xl font-bold text-foreground">Pages CMS</h2>
          <p className="text-sm text-steel">
            {pages.length} page{pages.length > 1 ? "s" : ""} ·
            <span className="text-success ml-1">
              {publishedCount} publiée{publishedCount > 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <Link
          href="/admin/pages/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ember text-white rounded-lg font-medium text-sm hover:bg-ember-deep transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle page
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
              placeholder="Rechercher (titre, slug)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember"
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

      {filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-12 text-center text-steel-soft"
        >
          <FileText className="w-8 h-8 mx-auto mb-2 text-steel-soft" />
          {pages.length === 0
            ? "Aucune page CMS. Créez-en une pour commencer."
            : "Aucune page ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border overflow-hidden"
        >
          <div className="divide-y divide-border/50">
            {filtered.map((page) => (
              <div
                key={page.id}
                className="flex items-center gap-4 p-4 hover:bg-bone-soft/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-ember/10 text-ember flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="font-medium text-foreground hover:text-ember transition-colors"
                  >
                    {page.title}
                  </Link>
                  <p className="text-xs text-steel-soft font-mono">
                    /p/{page.slug}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        page.isPublished
                          ? "bg-success-soft text-success"
                          : "bg-bone-soft text-steel",
                      )}
                    >
                      {page.isPublished ? "Publiée" : "Brouillon"}
                    </span>
                    {page.updatedAt && (
                      <span className="text-xs text-steel-soft">
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
                      className="p-1.5 rounded-lg hover:bg-bone-soft text-steel hover:text-ember transition-colors"
                      aria-label="Voir la page publique"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="p-1.5 rounded-lg hover:bg-bone-soft text-steel hover:text-ember transition-colors"
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
