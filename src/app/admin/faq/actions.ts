"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminRole } from "@/lib/auth/require-admin";

export interface FaqArticleInput {
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
}

function validate(input: FaqArticleInput): string | null {
  if (!input.question.trim()) return "La question est requise.";
  if (!input.answer.trim()) return "La réponse est requise.";
  return null;
}

/**
 * Slugifie un libellé de catégorie FAQ (sans dépendance, miroir basique de
 * la backfill SQL de la migration 011) : minuscules, suppression des
 * diacritiques courants, remplacement des non-alphanum par tirets.
 */
function slugifyCategory(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Canonicalise la catégorie FAQ pour éviter la fragmentation
 * (« Livraison » vs « livraison » vs « LIVRAISON » → 3 groupes distincts).
 *
 * Calcule le slug, cherche s'il existe déjà un article avec ce slug, et si
 * oui, réutilise SON libellé `category` comme canonical (le premier qui a
 * été écrit gagne). Sinon on garde le libellé saisi par l'admin tel quel
 * (devient la forme canonique pour les futurs articles de cette catégorie).
 *
 * Renvoie `{ category: null, categorySlug: null }` si l'input est vide.
 */
async function canonicalizeCategory(
  admin: SupabaseClient,
  raw: string | null,
  excludeId?: string,
): Promise<{ category: string | null; categorySlug: string | null }> {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return { category: null, categorySlug: null };

  const slug = slugifyCategory(trimmed);
  if (!slug) return { category: trimmed, categorySlug: null };

  // Recherche d'un article existant avec le même slug (premier wins).
  let query = admin
    .from("faq_articles")
    .select("category")
    .eq("category_slug", slug)
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();

  return {
    category:
      (data?.category as string | undefined)?.trim() || trimmed,
    categorySlug: slug,
  };
}

function revalidateAll() {
  revalidatePath("/admin/faq");
  revalidatePath("/aide");
}

export async function createFaqArticle(
  input: FaqArticleInput,
): Promise<{ ok: boolean; error?: string }> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { category, categorySlug } = await canonicalizeCategory(
    admin,
    input.category,
  );
  const { data, error } = await admin
    .from("faq_articles")
    .insert({
      question: input.question.trim(),
      answer: input.answer.trim(),
      category,
      category_slug: categorySlug,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createFaqArticle]", error);
    return { ok: false, error: "Erreur de création." };
  }

  revalidateAll();
  redirect(`/admin/faq/${data.id}`);
}

export async function updateFaqArticle(
  id: string,
  input: FaqArticleInput,
): Promise<{ ok: boolean; error?: string }> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { category, categorySlug } = await canonicalizeCategory(
    admin,
    input.category,
    id,
  );
  const { error } = await admin
    .from("faq_articles")
    .update({
      question: input.question.trim(),
      answer: input.answer.trim(),
      category,
      category_slug: categorySlug,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateFaqArticle]", error);
    return { ok: false, error: "Erreur de mise à jour." };
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteFaqArticle(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("faq_articles").delete().eq("id", id);

  if (error) {
    console.error("[deleteFaqArticle]", error);
    return { ok: false, error: "Erreur de suppression." };
  }

  revalidateAll();
  return { ok: true };
}

export async function toggleFaqActive(
  id: string,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("faq_articles")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[toggleFaqActive]", error);
    return { ok: false, error: "Erreur." };
  }

  revalidateAll();
  return { ok: true };
}
