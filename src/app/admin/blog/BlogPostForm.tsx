"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Save,
  Loader2,
  Trash2,
  ExternalLink,
  X,
  Plus,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn, slugify, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { AdminBlogPostDetail } from "@/lib/queries/admin";
import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
  type BlogPostInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-foreground mb-1";

export function BlogPostForm({ post }: { post: AdminBlogPostDetail | null }) {
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
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

  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const buildPayload = (): BlogPostInput => ({
    title: title.trim(),
    slug: slug.trim() || slugify(title),
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
        toast.success("Article mis à jour");
      } else {
        const res = await createBlogPost(payload);
        if (res && !res.ok) {
          toast.error(res.error ?? "Erreur");
        }
        // Sur succès → redirect()
      }
    });
  };

  const handleDelete = () => {
    if (!post) return;
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    startDeleteTransition(async () => {
      const res = await deleteBlogPost(post.id);
      if (res && !res.ok) {
        toast.error(res.error ?? "Erreur");
      }
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
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
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
                onClick={handleDelete}
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing && (!slug || slug === slugify(title))) {
                    setSlug(slugify(e.target.value));
                  }
                }}
                className={cn(inputClass, "text-base")}
                placeholder="Comment entretenir vos bijoux en fleurs séchées"
              />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={cn(inputClass, "font-mono text-xs")}
              />
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
              <p className="text-xs text-muted-light mt-1">
                {excerpt.length}/300 caractères
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <label className={labelClass}>Contenu</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              className={cn(inputClass, "resize-none font-mono text-xs")}
              placeholder={`Markdown léger pris en charge :

## Titre de section

Paragraphe de contenu. Saut de ligne simple = ligne, double saut = nouveau paragraphe.

### Sous-titre

- Élément de liste 1
- Élément de liste 2

Du HTML brut (commençant par <) sera injecté tel quel.`}
            />
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
              <p className="text-xs text-muted-light mt-1">
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
              <p className="text-xs text-muted-light mt-1">
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
                className="rounded accent-terracotta"
              />
            </label>
            {post?.publishedAt && (
              <p className="text-xs text-muted-light">
                Publié le {formatDate(post.publishedAt)}
              </p>
            )}
            {post?.authorName && (
              <p className="text-xs text-muted-light mt-1">
                Par {post.authorName}
              </p>
            )}
            {isEditing && post && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline mt-3"
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
            {coverImageUrl ? (
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-muted-soft mb-3">
                <Image
                  src={coverImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="320px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="aspect-[16/10] rounded-lg bg-muted-soft flex items-center justify-center mb-3">
                <ImageIcon className="w-8 h-8 text-muted-light" />
              </div>
            )}
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.length === 0 ? (
                <p className="text-xs text-muted-light">Aucun tag</p>
              ) : (
                tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-beige-nude-light text-foreground text-xs px-2 py-1 rounded-full"
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
                className="px-3 py-2 bg-muted-soft hover:bg-border rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
