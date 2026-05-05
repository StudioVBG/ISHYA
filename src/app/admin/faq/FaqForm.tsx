"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { AdminFaqArticle } from "@/lib/queries/admin";
import {
  createFaqArticle,
  updateFaqArticle,
  type FaqArticleInput,
} from "./actions";

interface FaqFormProps {
  article?: AdminFaqArticle;
}

export function FaqForm({ article }: FaqFormProps) {
  const router = useRouter();
  const isEdit = Boolean(article);

  const [question, setQuestion] = useState(article?.question ?? "");
  const [answer, setAnswer] = useState(article?.answer ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [sortOrder, setSortOrder] = useState(article?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(article?.isActive ?? true);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: FaqArticleInput = {
      question,
      answer,
      category: category || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isActive,
    };

    startTransition(async () => {
      const res = isEdit
        ? await updateFaqArticle(article!.id, input)
        : await createFaqArticle(input);

      if (res.ok) {
        toast.success(isEdit ? "Question mise à jour" : "Question créée");
        if (isEdit) router.refresh();
      } else {
        toast.error(res.error ?? "Erreur");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            placeholder="Quelle est la question fréquemment posée ?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Réponse <span className="text-red-500">*</span>
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            rows={6}
            placeholder="Rédigez la réponse complète. Le markdown simple est supporté côté affichage."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Catégorie
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Commandes, Livraison, Entretien…"
              list="faq-categories"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
            <datalist id="faq-categories">
              <option value="Commandes" />
              <option value="Livraison" />
              <option value="Retours et échanges" />
              <option value="Paiement" />
              <option value="Entretien des bijoux" />
              <option value="Mon compte" />
            </datalist>
            <p className="text-xs text-gray-500 mt-1">
              Sert à regrouper les questions sur la page /aide.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ordre
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
            <p className="text-xs text-gray-500 mt-1">Tri croissant.</p>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="mt-1 w-4 h-4 accent-terracotta"
          />
          <span className="text-sm">
            <span className="font-medium text-gray-900 block">
              Visible publiquement
            </span>
            <span className="text-gray-500">
              Décocher pour cacher la question sans la supprimer.
            </span>
          </span>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/faq"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Retour à la liste
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEdit ? "Enregistrer" : "Créer la question"}
        </button>
      </div>
    </form>
  );
}
