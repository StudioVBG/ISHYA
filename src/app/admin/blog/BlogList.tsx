"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, FileText, BookOpen } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminBlogPostRow } from "@/lib/queries/admin";

export function BlogList({ posts }: { posts: AdminBlogPostRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter === "published" && !p.isPublished) return false;
      if (statusFilter === "draft" && p.isPublished) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.slug.toLowerCase().includes(q) &&
          !p.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [posts, search, statusFilter]);

  const publishedCount = posts.filter((p) => p.isPublished).length;
  const draftCount = posts.length - publishedCount;

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
          <h2 className="text-xl font-bold text-foreground">Blog</h2>
          <p className="text-sm text-muted">
            {posts.length} article{posts.length > 1 ? "s" : ""} ·
            <span className="text-success ml-1">
              {publishedCount} publié{publishedCount > 1 ? "s" : ""}
            </span>{" "}
            ·
            <span className="text-muted ml-1">
              {draftCount} brouillon{draftCount > 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <Link
          href="/admin/blog/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </Link>
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
              placeholder="Rechercher (titre, slug, tag)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                ["all", "Tous"],
                ["published", "Publiés"],
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
                    : "bg-white border border-border text-muted hover:bg-muted-soft",
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
          className="bg-white rounded-xl border border-border p-12 text-center text-muted-light"
        >
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-light" />
          {posts.length === 0
            ? "Aucun article. Créez votre premier article pour démarrer le blog."
            : "Aucun article ne correspond à votre recherche."}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border overflow-hidden"
        >
          <div className="divide-y divide-border/50">
            {filtered.map((post) => (
              <Link
                key={post.id}
                href={`/admin/blog/${post.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted-soft/50 transition-colors group"
              >
                <div className="w-20 h-14 rounded-lg bg-muted-soft overflow-hidden shrink-0 relative">
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-light" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground group-hover:text-terracotta transition-colors truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-light font-mono truncate">
                    /{post.slug}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        post.isPublished
                          ? "bg-success-soft text-success"
                          : "bg-muted-soft text-muted",
                      )}
                    >
                      {post.isPublished ? "Publié" : "Brouillon"}
                    </span>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-beige-nude-light text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.publishedAt && (
                      <span className="text-xs text-muted-light">
                        · {formatDate(post.publishedAt)}
                      </span>
                    )}
                    {post.authorName && (
                      <span className="text-xs text-muted-light">
                        · par {post.authorName}
                      </span>
                    )}
                  </div>
                </div>
                <Edit2 className="w-4 h-4 text-muted-light group-hover:text-terracotta transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
