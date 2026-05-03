"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export type BannerPlacement =
  | "hero"
  | "category"
  | "sidebar"
  | "popup"
  | "footer"
  | "announcement_bar";

export interface BannerInput {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  placement: BannerPlacement;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
}

function validate(input: BannerInput): string | null {
  if (!input.title.trim()) return "Le titre est requis";
  return null;
}

function revalidateAll() {
  revalidatePath("/admin/bannieres");
  revalidatePath("/");
}

export async function createBanner(
  input: BannerInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("banners").insert({
    title: input.title.trim(),
    subtitle: input.subtitle,
    image_url: input.imageUrl,
    link_url: input.linkUrl,
    placement: input.placement,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  });

  if (error) {
    console.error("[createBanner]", error);
    return { ok: false, error: "Erreur de création" };
  }
  revalidateAll();
  return { ok: true };
}

export async function updateBanner(
  id: string,
  input: BannerInput,
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("banners")
    .update({
      title: input.title.trim(),
      subtitle: input.subtitle,
      image_url: input.imageUrl,
      link_url: input.linkUrl,
      placement: input.placement,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateBanner]", error);
    return { ok: false, error: "Erreur de mise à jour" };
  }
  revalidateAll();
  return { ok: true };
}

export async function deleteBanner(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole(["admin", "super_admin"]);
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("banners").delete().eq("id", id);
  if (error) {
    console.error("[deleteBanner]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  revalidateAll();
  return { ok: true };
}
