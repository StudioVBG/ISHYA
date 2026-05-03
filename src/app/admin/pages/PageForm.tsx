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
import type { AdminCmsPageDetail } from "@/lib/queries/admin";
import {
  createCmsPage,
  deleteCmsPage,
  updateCmsPage,
  type CmsPageInput,
} from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-gray-700 mb-1";

export function PageForm({ page }: { page: AdminCmsPageDetail | null }) {
  const isEditing = !!page;

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [body, setBody] = useState(page?.body ?? "");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page?.metaDescription ?? "",
  );
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? false);

  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const buildPayload = (): CmsPageInput => ({
    title: title.trim(),
    slug: slug.trim() || slugify(title),
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
        toast.success("Page mise à jour");
      } else {
        const res = await createCmsPage(payload);
        if (res && !res.ok) {
          toast.error(res.error ?? "Erreur");
        }
      }
    });
  };

  const handleDelete = () => {
    if (!page) return;
    if (!window.confirm("Supprimer définitivement cette page ?")) return;
    startDeleteTransition(async () => {
      const res = await deleteCmsPage(page.id);
      if (res && !res.ok) {
        toast.error(res.error ?? "Erreur");
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
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux pages
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? `Éditer : ${page?.title}` : "Nouvelle page"}
          </h1>
          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={handleDelete}
                disabled={isDeletePending}
                className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
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
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
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
                placeholder="À propos, FAQ, Newsletter..."
              />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">/p/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={cn(inputClass, "font-mono text-xs flex-1")}
                  placeholder="a-propos"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Lettres minuscules, chiffres et tirets uniquement.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <label className={labelClass}>Contenu</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              className={cn(inputClass, "resize-none font-mono text-xs")}
              placeholder={`Markdown léger : ## Titre, ### Sous-titre, paragraphes séparés par des lignes vides, listes - ou *. HTML brut accepté si commence par <.`}
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <h2 className="text-base font-semibold text-gray-900">SEO</h2>
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
              <p className="text-xs text-gray-400 mt-1">
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
              <p className="text-xs text-gray-400 mt-1">
                {metaDescription.length}/160 caractères
              </p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <h3 className="font-semibold text-gray-900 mb-3">Publication</h3>
            <label className="flex items-center justify-between cursor-pointer mb-3">
              <span className="text-sm text-gray-700">
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
              <p className="text-xs text-gray-400">
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
    </motion.div>
  );
}
