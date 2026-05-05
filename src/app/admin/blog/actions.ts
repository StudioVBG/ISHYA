"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/utils";

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  coverImageUrl: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

function validate(input: BlogPostInput): string | null {
  if (!input.title.trim()) return "Le titre est requis";
  if (!input.slug.trim()) return "Le slug est requis";
  return null;
}

function revalidateAll(slug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createBlogPost(
  input: BlogPostInput,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  // Récupérer l'utilisateur courant (devient l'auteur par défaut)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const publishedAt =
    input.isPublished && !input.publishedAt
      ? new Date().toISOString()
      : input.publishedAt;

  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title: input.title.trim(),
      slug: input.slug.trim() || slugify(input.title),
      excerpt: input.excerpt,
      body: input.body,
      cover_image_url: input.coverImageUrl,
      tags: input.tags,
      is_published: input.isPublished,
      published_at: input.isPublished ? publishedAt : null,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
      author_id: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createBlogPost]", error);
    return {
      ok: false,
      error: error?.message?.includes("duplicate")
        ? "Ce slug est déjà utilisé"
        : "Erreur de création",
    };
  }

  revalidateAll(input.slug);
  redirect(`/admin/blog/${data.id}`);
}

export async function updateBlogPost(
  id: string,
  input: BlogPostInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();

  // Si on publie pour la première fois, on set published_at à maintenant
  let publishedAt = input.publishedAt;
  if (input.isPublished && !publishedAt) {
    const { data: current } = await admin
      .from("blog_posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    publishedAt = current?.published_at ?? new Date().toISOString();
  }

  const { error } = await admin
    .from("blog_posts")
    .update({
      title: input.title.trim(),
      slug: input.slug.trim(),
      excerpt: input.excerpt,
      body: input.body,
      cover_image_url: input.coverImageUrl,
      tags: input.tags,
      is_published: input.isPublished,
      published_at: input.isPublished ? publishedAt : null,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateBlogPost]", error);
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

export async function deleteBlogPost(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: post } = await admin
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) {
    console.error("[deleteBlogPost]", error);
    return { ok: false, error: "Erreur de suppression" };
  }

  revalidateAll(post?.slug);
  redirect("/admin/blog");
}
