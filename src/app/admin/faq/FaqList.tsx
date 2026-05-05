"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Eye, EyeOff, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { AdminFaqArticle } from "@/lib/queries/admin";
import { deleteFaqArticle, toggleFaqActive } from "./actions";

interface FaqListProps {
  articles: AdminFaqArticle[];
}

export function FaqList({ articles }: FaqListProps) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

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

  const onDelete = (id: string, question: string) => {
    if (!confirm(`Supprimer la question « ${question} » ?`)) return;
    startTransition(async () => {
      const res = await deleteFaqArticle(id);
      if (res.ok) toast.success("Question supprimée");
      else toast.error(res.error ?? "Erreur");
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          placeholder="Rechercher une question…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-sm text-gray-500">
            {query
              ? "Aucune question ne correspond à votre recherche."
              : "Aucune question pour l'instant. Créez la première."}
          </p>
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <div
            key={category}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                {category}{" "}
                <span className="text-gray-400">({items.length})</span>
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {items.map((a) => (
                <li
                  key={a.id}
                  className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-gray-50/60"
                >
                  <Link
                    href={`/admin/faq/${a.id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {a.question}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {a.answer}
                    </p>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggle(a.id, a.isActive)}
                      disabled={pending}
                      className={
                        a.isActive
                          ? "p-1.5 rounded-md text-green-600 hover:bg-green-50"
                          : "p-1.5 rounded-md text-gray-400 hover:bg-gray-100"
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
                      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(a.id, a.question)}
                      disabled={pending}
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
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
    </div>
  );
}
