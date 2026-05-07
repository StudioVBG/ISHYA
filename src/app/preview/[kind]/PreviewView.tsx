"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, RefreshCw, X } from "lucide-react";
import {
  PREVIEW_STORAGE_KEY,
  type PreviewDraft,
  type BlogPreviewDraft,
  type PagePreviewDraft,
} from "@/lib/admin/preview";
import { renderCmsBody } from "@/lib/cms/render-body";
import { formatDate } from "@/lib/utils";

type Props = { kind: "blog" | "page" };

/**
 * Aperçu admin (blog + pages CMS) — lit le brouillon stocké en
 * `localStorage` et le rend avec un layout proche du storefront.
 *
 * Aucun appel serveur, aucune donnée fuitée : ce qui est rendu provient
 * exclusivement du localStorage du visiteur lui-même.
 *
 * Sync via `useSyncExternalStore` (React 19) — quand l'admin clique
 * « Aperçu » à nouveau dans l'autre onglet, l'event `storage` met à jour
 * cet onglet automatiquement.
 */

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === PREVIEW_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PREVIEW_STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

export function PreviewView({ kind }: Props) {
  // refreshTick force un re-render → re-call de getSnapshot. Utile pour le
  // bouton « Recharger » manuel (l'event `storage` ne se déclenche pas
  // dans le même onglet que l'écriture).
  const [refreshTick, setRefreshTick] = useState(0);
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const draft: PreviewDraft | null = useMemo(() => {
    void refreshTick;
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as PreviewDraft;
      if (parsed.kind !== kind) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [raw, kind, refreshTick]);

  const handleRefresh = () => setRefreshTick((t) => t + 1);

  if (!draft) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted-soft">
            <Eye className="w-6 h-6 text-muted" />
          </div>
          <h1 className="font-display text-2xl">Aucun aperçu disponible</h1>
          <p className="text-muted text-sm leading-relaxed">
            Cet onglet ne contient pas de brouillon. Retournez à l&apos;éditeur
            admin et cliquez sur <strong>Aperçu</strong>, puis rafraîchissez
            cette page.
          </p>
          <p className="text-xs text-muted-light">
            Les brouillons expirent après 30 minutes pour éviter d&apos;afficher
            un contenu obsolète.
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <PreviewBanner onRefresh={handleRefresh} />
      {draft.kind === "blog" ? (
        <BlogPreview draft={draft} />
      ) : (
        <PagePreview draft={draft} />
      )}
    </div>
  );
}

function PreviewBanner({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="sticky top-0 z-50 bg-warning-soft text-warning border-b border-warning/30 shadow-sm">
      <div className="container max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye className="w-4 h-4 flex-shrink-0" />
          <span>Aperçu non publié — visible uniquement dans cet onglet.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-warning/15 hover:bg-warning/25 transition-colors"
            title="Recharger depuis le dernier brouillon"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recharger
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-warning/15 hover:bg-warning/25 transition-colors"
            title="Fermer l'onglet"
          >
            <X className="w-3.5 h-3.5" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function BlogPreview({ draft }: { draft: BlogPreviewDraft }) {
  return (
    <article className="py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <Link
          href="#"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1.5 text-sm text-muted mb-8 cursor-default"
        >
          ← Retour au journal
        </Link>

        {draft.tags[0] && (
          <span className="inline-block bg-terracotta/10 text-terracotta-dark text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            {draft.tags[0]}
          </span>
        )}

        <h1 className="font-display text-3xl md:text-5xl mb-4 leading-tight">
          {draft.title || "Sans titre"}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {draft.publishedAt
              ? formatDate(draft.publishedAt)
              : "Pas encore publié"}
          </span>
          {draft.authorName && (
            <>
              <span>·</span>
              <span>Par {draft.authorName}</span>
            </>
          )}
        </div>

        {draft.coverImageUrl && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-beige-nude-light">
            <Image
              src={draft.coverImageUrl}
              alt={draft.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {draft.excerpt && (
          <p className="text-lg text-muted leading-relaxed mb-8 italic">
            {draft.excerpt}
          </p>
        )}

        <div className="text-foreground/85 text-base">
          {renderCmsBody(draft.body)}
        </div>

        {draft.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
            {draft.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-beige-nude-light text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function PagePreview({ draft }: { draft: PagePreviewDraft }) {
  return (
    <article className="py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-5xl mb-4 leading-tight">
          {draft.title || "Sans titre"}
        </h1>
        {draft.publishedAt && (
          <p className="text-sm text-muted mb-8">
            Mise à jour le {formatDate(draft.publishedAt)}
          </p>
        )}
        <div className="text-foreground/85 text-base">
          {renderCmsBody(draft.body)}
        </div>
      </div>
    </article>
  );
}
