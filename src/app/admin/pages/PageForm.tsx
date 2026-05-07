"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Save,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn, slugify, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { DraftRestoreBanner } from "@/components/admin/DraftRestoreBanner";
import {
  buildDraftKey,
  clearDraft,
  useAutosave,
  useStoredDraft,
} from "@/lib/admin/draft-autosave";
import type { AdminCmsPageDetail } from "@/lib/queries/admin";
import {
  createCmsPage,
  deleteCmsPage,
  updateCmsPage,
  type CmsPageInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-foreground mb-1";

export function PageForm({ page }: { page: AdminCmsPageDetail | null }) {
  const isEditing = !!page;

  const [title, setTitle] = useState(page?.title ?? "");
  const [body, setBody] = useState(page?.body ?? "");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page?.metaDescription ?? "",
  );
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draftDismissed, setDraftDismissed] = useState(false);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  // Autosave brouillon : restauration proposée si un brouillon plus
  // récent que la dernière sauvegarde serveur est trouvé.
  const draftKey = buildDraftKey("page", page?.id ?? null);
  const storedDraft = useStoredDraft(draftKey);
  const serverSavedAt = page?.updatedAt
    ? new Date(page.updatedAt).getTime()
    : 0;
  const showDraftBanner =
    !draftDismissed &&
    !!storedDraft &&
    storedDraft.savedAt > serverSavedAt;

  useAutosave(draftKey, {
    title,
    body,
    metaTitle,
    metaDescription,
    isPublished,
  });

  const handleRestoreDraft = () => {
    if (!storedDraft) return;
    const d = storedDraft.data as Partial<{
      title: string;
      body: string;
      metaTitle: string;
      metaDescription: string;
      isPublished: boolean;
    }>;
    if (typeof d.title === "string") setTitle(d.title);
    if (typeof d.body === "string") setBody(d.body);
    if (typeof d.metaTitle === "string") setMetaTitle(d.metaTitle);
    if (typeof d.metaDescription === "string") setMetaDescription(d.metaDescription);
    if (typeof d.isPublished === "boolean") setIsPublished(d.isPublished);
    setDraftDismissed(true);
    toast.success("Brouillon restauré");
  };

  const handleDismissDraft = () => {
    clearDraft(draftKey);
    setDraftDismissed(true);
  };

  const buildPayload = (): CmsPageInput => ({
    title: title.trim(),
    body: body.trim() || null,
    metaTitle: metaTitle.trim() || null,
    metaDescription: metaDescription.trim() || null,
    isPublished,
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Titre requis");
      return;
    }
    startSaveTransition(async () => {
      const payload = buildPayload();
      if (isEditing && page) {
        const res = await updateCmsPage(page.id, payload);
        if (!res.ok) {
          toast.error(res.error ?? "Erreur");
          return;
        }
        clearDraft(draftKey);
        toast.success("Page mise à jour");
      } else {
        const res = await createCmsPage(payload);
        if (res && !res.ok) {
          toast.error(res.error ?? "Erreur");
        } else {
          clearDraft(draftKey);
        }
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!page) return;
    startDeleteTransition(async () => {
      const res = await deleteCmsPage(page.id);
      if (res && !res.ok) {
        toast.error(res.error ?? "Erreur");
        setConfirmDelete(false);
      }
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux pages
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-bold text-foreground">
            {isEditing ? `Éditer : ${page?.title}` : "Nouvelle page"}
          </h1>
          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isDeletePending}
                className="inline-flex items-center gap-2 px-3 py-2 border border-destructive/30 text-destructive bg-destructive-soft rounded-lg text-sm font-medium hover:bg-destructive/15 transition-colors disabled:opacity-50"
              >
                {isDeletePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSavePending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
            >
              {isSavePending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </motion.div>

      <DraftRestoreBanner
        savedAt={storedDraft?.savedAt ?? 0}
        show={showDraftBanner}
        onRestore={handleRestoreDraft}
        onDismiss={handleDismissDraft}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6 space-y-4"
          >
            <div>
              <label className={labelClass}>Titre *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(inputClass, "text-base")}
                placeholder="À propos, FAQ, Newsletter..."
              />
              {(title.trim() || page?.slug) && (
                <p className="text-xs text-muted mt-1">
                  Adresse de la page : /p/
                  <span className="font-mono">
                    {page?.slug ?? slugify(title)}
                  </span>
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <label className={labelClass}>Contenu</label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Commencez à écrire la page…"
              imageFolder="pages-cms"
              disabled={isSavePending || isDeletePending}
            />
            <p className="text-xs text-muted-light mt-2">
              Sortie : HTML, sanitizé côté storefront via DOMPurify (les tags
              dangereux comme <code>&lt;script&gt;</code> sont strippés).
              L&apos;ancien contenu markdown léger reste compatible : il
              s&apos;affichera tel quel si jamais l&apos;éditeur ne le
              parse pas.
            </p>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6 space-y-4"
          >
            <h2 className="text-base font-semibold text-foreground">SEO</h2>
            <div>
              <label className={labelClass}>Meta title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
                className={inputClass}
                placeholder="Si vide → titre de la page"
              />
              <p className="text-xs text-muted-light mt-1">
                {metaTitle.length}/60 caractères
              </p>
            </div>
            <div>
              <label className={labelClass}>Meta description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                maxLength={160}
                className={cn(inputClass, "resize-none")}
              />
              <p className="text-xs text-muted-light mt-1">
                {metaDescription.length}/160 caractères
              </p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-3">Publication</h3>
            <label className="flex items-center justify-between cursor-pointer mb-3">
              <span className="text-sm text-foreground">
                {isPublished ? "Publiée" : "Brouillon"}
              </span>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded accent-terracotta"
              />
            </label>
            {page?.publishedAt && (
              <p className="text-xs text-muted-light">
                Publiée le {formatDate(page.publishedAt)}
              </p>
            )}
            {isEditing && page && page.isPublished && (
              <Link
                href={`/p/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline mt-3"
              >
                Voir la page publique
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer définitivement cette page ?"
        description={
          page
            ? `« ${page.title} » sera supprimée. Cette action est irréversible.`
            : undefined
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={isDeletePending}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}
