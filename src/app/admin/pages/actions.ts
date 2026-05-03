"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export interface CmsPageInput {
  title: string;
  slug: string;
  body: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
}

function validate(input: CmsPageInput): string | null {
  if (!input.title.trim()) return "Le titre est requis";
  if (!input.slug.trim()) return "Le slug est requis";
  if (!/^[a-z0-9-]+$/.test(input.slug.trim())) {
    return "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets";
  }
  return null;
}

function revalidateAll(slug?: string) {
  revalidatePath("/admin/pages");
  if (slug) revalidatePath(`/p/${slug}`);
}

export async function createCmsPage(
  input: CmsPageInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cms_pages")
    .insert({
      title: input.title.trim(),
      slug: input.slug.trim(),
      body: input.body,
      meta_title: input.metaTitle,
      meta_description: input.metaDescription,
      is_published: input.isPublished,
      published_at: input.isPublished ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    console.error("[createCmsPage]", error);
    return {
      ok: false,
      error: error?.message?.includes("duplicate")
        ? "Ce slug est déjà utilisé"
        : "Erreur de création",
    };
  }

  revalidateAll(data.slug);
  redirect(`/admin/pages/${data.id}`);
}

export async function updateCmsPage(
  id: string,
  input: CmsPageInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  // published_at is set only on first publication
  let publishedAt: string | null = null;
  if (input.isPublished) {
    const { data: current } = await admin
      .from("cms_pages")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    publishedAt = current?.published_at ?? new Date().toISOString();
  }

  const { error } = await admin
    .from("cms_pages")
    .update({
      title: input.title.trim(),
      slug: input.slug.trim(),
      body: input.body,
      meta_title: input.metaTitle,
      meta_description: input.metaDescription,
      is_published: input.isPublished,
      published_at: input.isPublished ? publishedAt : null,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateCmsPage]", error);
    return {
      ok: false,
      error: error.message?.includes("duplicate")
        ? "Ce slug est déjà utilisé"
        : "Erreur de mise à jour",
    };
  }

  revalidateAll(input.slug);
  return { ok: true };
}

export async function deleteCmsPage(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole(["admin", "super_admin"]);
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: page } = await admin
    .from("cms_pages")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("cms_pages").delete().eq("id", id);
  if (error) {
    console.error("[deleteCmsPage]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  revalidateAll(page?.slug);
  redirect("/admin/pages");
}
