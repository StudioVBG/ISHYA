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
  Eye,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn, slugify, formatDate } from "@/lib/utils";
// slugify reste utilisé pour l'aperçu d'URL en création (le slug réel
// est calculé par le serveur, qui résoud les collisions automatiquement).
import { staggerContainer, staggerItem } from "@/lib/animations";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DraftRestoreBanner } from "@/components/admin/DraftRestoreBanner";
import {
  buildDraftKey,
  clearDraft,
  useAutosave,
  useStoredDraft,
} from "@/lib/admin/draft-autosave";
import { openPreview } from "@/lib/admin/preview";
import type { AdminBlogPostDetail } from "@/lib/queries/admin";
import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
  type BlogPostInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember";
const labelClass = "block text-xs font-medium text-foreground mb-1";

export function BlogPostForm({ post }: { post: AdminBlogPostDetail | null }) {
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false);
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seoDescription ?? "",
  );

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draftDismissed, setDraftDismissed] = useState(false);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  // Autosave brouillon : key par-id (ou "new" en création), restauration
  // proposée si un brouillon plus récent que la dernière sauvegarde
  // serveur est trouvé.
  const draftKey = buildDraftKey("blog", post?.id ?? null);
  const storedDraft = useStoredDraft(draftKey);
  const serverSavedAt = post?.updatedAt
    ? new Date(post.updatedAt).getTime()
    : 0;
  const showDraftBanner =
    !draftDismissed &&
    !!storedDraft &&
    storedDraft.savedAt > serverSavedAt;

  useAutosave(draftKey, {
    title,
    excerpt,
    body,
    coverImageUrl,
    tags,
    isPublished,
    seoTitle,
    seoDescription,
  });

  const handleRestoreDraft = () => {
    if (!storedDraft) return;
    const d = storedDraft.data as Partial<{
      title: string;
      excerpt: string;
      body: string;
      coverImageUrl: string;
      tags: string[];
      isPublished: boolean;
      seoTitle: string;
      seoDescription: string;
    }>;
    if (typeof d.title === "string") setTitle(d.title);
    if (typeof d.excerpt === "string") setExcerpt(d.excerpt);
    if (typeof d.body === "string") setBody(d.body);
    if (typeof d.coverImageUrl === "string") setCoverImageUrl(d.coverImageUrl);
    if (Array.isArray(d.tags)) setTags(d.tags.filter((t) => typeof t === "string"));
    if (typeof d.isPublished === "boolean") setIsPublished(d.isPublished);
    if (typeof d.seoTitle === "string") setSeoTitle(d.seoTitle);
    if (typeof d.seoDescription === "string") setSeoDescription(d.seoDescription);
    setDraftDismissed(true);
    toast.success("Brouillon restauré");
  };

  const handleDismissDraft = () => {
    clearDraft(draftKey);
    setDraftDismissed(true);
  };

  const buildPayload = (): BlogPostInput => ({
    title: title.trim(),
    excerpt: excerpt.trim() || null,
    body: body.trim() || null,
    coverImageUrl: coverImageUrl.trim() || null,
    tags,
    isPublished,
    publishedAt: post?.publishedAt ?? null,
    seoTitle: seoTitle.trim() || null,
    seoDescription: seoDescription.trim() || null,
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    startSaveTransition(async () => {
      const payload = buildPayload();
      if (isEditing && post) {
        const res = await updateBlogPost(post.id, payload);
        if (!res.ok) {
          toast.error(res.error ?? "Erreur");
          return;
        }
        clearDraft(draftKey);
        toast.success("Article mis à jour");
      } else {
        const res = await createBlogPost(payload);
        if (res && !res.ok) {
          toast.error(res.error ?? "Erreur");
        } else {
          // Succès → redirect() côté serveur. On nettoie le brouillon
          // "new" maintenant pour qu'il ne réapparaisse pas la prochaine
          // fois que l'admin clique « Nouvel article ».
          clearDraft(draftKey);
        }
      }
    });
  };

  const handlePreview = () => {
    if (!title.trim() && !body.trim()) {
      toast.error("Saisissez au moins un titre ou du contenu pour prévisualiser");
      return;
    }
    openPreview({
      kind: "blog",
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      body: body.trim() || null,
      coverImageUrl: coverImageUrl.trim() || null,
      tags,
      authorName: post?.authorName ?? null,
      publishedAt: post?.publishedAt ?? null,
      savedAt: Date.now(),
    });
  };

  const handleConfirmDelete = () => {
    if (!post) return;
    startDeleteTransition(async () => {
      const res = await deleteBlogPost(post.id);
      if (res && !res.ok) {
        toast.error(res.error ?? "Erreur");
        setConfirmDelete(false);
      }
      // Sur succès → redirect() côté serveur
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) {
      setTagInput("");
      return;
    }
    setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
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
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm text-steel hover:text-ink transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux articles
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-bold text-foreground">
            {isEditing ? `Éditer : ${post?.title}` : "Nouvel article"}
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
              onClick={handlePreview}
              disabled={isSavePending || isDeletePending}
              className="inline-flex items-center gap-2 px-3 py-2 border border-border text-foreground bg-white rounded-lg text-sm font-medium hover:bg-bone-soft transition-colors disabled:opacity-50"
              title="Ouvrir l'aperçu dans un nouvel onglet"
            >
              <Eye className="w-4 h-4" />
              Aperçu
            </button>
            <button
              onClick={handleSave}
              disabled={isSavePending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ember text-white rounded-lg text-sm font-medium hover:bg-ember-deep transition-colors disabled:opacity-50"
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
                placeholder="Comment entretenir vos bijoux en fleurs séchées"
              />
              {(title.trim() || post?.slug) && (
                <p className="text-xs text-steel mt-1">
                  Adresse de l&apos;article : /blog/
                  <span className="font-mono">
                    {post?.slug ?? slugify(title)}
                  </span>
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Extrait</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                maxLength={300}
                className={cn(inputClass, "resize-none")}
                placeholder="Affiché sur la liste blog et en metadata"
              />
              <p className="text-xs text-steel-soft mt-1">
                {excerpt.length}/300 caractères
              </p>
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
              placeholder="Commencez à écrire l'article…"
              imageFolder="blog"
              disabled={isSavePending || isDeletePending}
            />
            <p className="text-xs text-steel-soft mt-2">
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
              <label className={labelClass}>Titre SEO</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={60}
                className={inputClass}
                placeholder="Si vide → titre de l'article"
              />
              <p className="text-xs text-steel-soft mt-1">
                {seoTitle.length}/60 caractères
              </p>
            </div>
            <div>
              <label className={labelClass}>Description SEO</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                maxLength={160}
                className={cn(inputClass, "resize-none")}
                placeholder="Si vide → extrait"
              />
              <p className="text-xs text-steel-soft mt-1">
                {seoDescription.length}/160 caractères
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
                {isPublished ? "Publié" : "Brouillon"}
              </span>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded accent-ember"
              />
            </label>
            {post?.publishedAt && (
              <p className="text-xs text-steel-soft">
                Publié le {formatDate(post.publishedAt)}
              </p>
            )}
            {post?.authorName && (
              <p className="text-xs text-steel-soft mt-1">
                Par {post.authorName}
              </p>
            )}
            {isEditing && post && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-ember hover:underline mt-3"
              >
                Voir la page publique
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-3">Image de couverture</h3>
            <SingleImageUploader
              value={coverImageUrl || null}
              onChange={(url) => setCoverImageUrl(url ?? "")}
              folder="blog"
              aspect="16/10"
              disabled={isSavePending}
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.length === 0 ? (
                <p className="text-xs text-steel-soft">Aucun tag</p>
              ) : (
                tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-bone-soft text-foreground text-xs px-2 py-1 rounded-full"
                  >
                    {t}
                    <button
                      onClick={() => removeTag(t)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Entretien, Guides..."
                className={cn(inputClass, "flex-1")}
              />
              <button
                onClick={addTag}
                className="px-3 py-2 bg-bone-soft hover:bg-border rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer définitivement cet article ?"
        description={
          post
            ? `« ${post.title} » sera supprimé. Cette action est irréversible.`
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
