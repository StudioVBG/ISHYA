"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const { data, error } = await admin
    .from("faq_articles")
    .insert({
      question: input.question.trim(),
      answer: input.answer.trim(),
      category: input.category?.trim() || null,
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
  const { error } = await admin
    .from("faq_articles")
    .update({
      question: input.question.trim(),
      answer: input.answer.trim(),
      category: input.category?.trim() || null,
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
