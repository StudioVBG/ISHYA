/**
 * Helper pour la prévisualisation de contenu non publié (blog + pages CMS).
 *
 * Pattern : on stocke un brouillon dans `localStorage` puis on ouvre une
 * route `/preview/<kind>` dans un nouvel onglet. La route lit le brouillon
 * client-side et le rend avec un layout proche du storefront. Aucune
 * donnée n'est jamais persistée côté serveur — c'est purement local.
 *
 * Sécurité : la route /preview est publique mais ne lit RIEN d'autre que
 * le localStorage du visiteur lui-même. Aucune fuite possible.
 */

export type PreviewKind = "blog" | "page";

export type BlogPreviewDraft = {
  kind: "blog";
  title: string;
  excerpt: string | null;
  body: string | null;
  coverImageUrl: string | null;
  tags: string[];
  authorName: string | null;
  publishedAt: string | null;
  savedAt: number;
};

export type PagePreviewDraft = {
  kind: "page";
  title: string;
  body: string | null;
  publishedAt: string | null;
  savedAt: number;
};

export type PreviewDraft = BlogPreviewDraft | PagePreviewDraft;

export const PREVIEW_STORAGE_KEY = "ishya:admin-preview-draft";

export function writePreviewDraft(draft: PreviewDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.error("[preview] writePreviewDraft", err);
  }
}

export function openPreview(draft: PreviewDraft) {
  writePreviewDraft(draft);
  window.open(`/preview/${draft.kind}`, "_blank", "noopener,noreferrer");
}
