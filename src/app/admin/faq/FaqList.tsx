"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Eye, EyeOff, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminFaqArticle } from "@/lib/queries/admin";
import { deleteFaqArticle, toggleFaqActive } from "./actions";

interface FaqListProps {
  articles: AdminFaqArticle[];
}

export function FaqList({ articles }: FaqListProps) {
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const deletingArticle = articles.find((a) => a.id === deletingId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.question.toLowerCase().includes(q) ||
        a.answer.toLowerCase().includes(q) ||
        (a.category ?? "").toLowerCase().includes(q),
    );
  }, [articles, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminFaqArticle[]>();
    for (const a of filtered) {
      const key = a.category ?? "Sans catégorie";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const onToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleFaqActive(id, !current);
      if (res.ok) {
        toast.success(current ? "Question masquée" : "Question publiée");
      } else {
        toast.error(res.error ?? "Erreur");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startTransition(async () => {
      const res = await deleteFaqArticle(id);
      if (res.ok) {
        toast.success("Question supprimée");
        setDeletingId(null);
      } else {
        toast.error(res.error ?? "Erreur");
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="search"
          placeholder="Rechercher une question…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <p className="text-sm text-muted">
            {query
              ? "Aucune question ne correspond à votre recherche."
              : "Aucune question pour l'instant. Créez la première."}
          </p>
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <div
            key={category}
            className="bg-white border border-border rounded-lg overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-muted-soft border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {category}{" "}
                <span className="text-muted">({items.length})</span>
              </h2>
            </div>
            <ul className="divide-y divide-border">
              {items.map((a) => (
                <li
                  key={a.id}
                  className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-muted-soft/60"
                >
                  <Link
                    href={`/admin/faq/${a.id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.question}
                    </p>
                    <p className="text-xs text-muted line-clamp-1 mt-0.5">
                      {a.answer}
                    </p>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggle(a.id, a.isActive)}
                      disabled={pending}
                      className={
                        a.isActive
                          ? "p-1.5 rounded-md text-success hover:bg-success-soft"
                          : "p-1.5 rounded-md text-muted hover:bg-muted-soft"
                      }
                      title={a.isActive ? "Publiée" : "Masquée"}
                    >
                      {a.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <Link
                      href={`/admin/faq/${a.id}`}
                      className="p-1.5 rounded-md text-muted hover:bg-muted-soft"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeletingId(a.id)}
                      disabled={pending}
                      className="p-1.5 rounded-md text-destructive hover:bg-destructive-soft"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer cette question ?"
        description={
          deletingArticle
            ? `« ${deletingArticle.question} » sera supprimée. Cette action est définitive.`
            : undefined
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={pending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
