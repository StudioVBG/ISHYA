"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { cleanupManagedUrlsServer } from "@/lib/admin/image-upload";

export type BannerPlacement =
  | "hero"
  | "category"
  | "sidebar"
  | "popup"
  | "footer"
  | "announcement_bar";

const ALLOWED_PLACEMENTS: BannerPlacement[] = [
  "hero",
  "category",
  "sidebar",
  "popup",
  "footer",
  "announcement_bar",
];

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

/**
 * Valide une URL de lien : doit être un chemin relatif (`/...`) ou une URL
 * absolue avec un protocole sûr (http/https/mailto/tel). Bloque
 * `javascript:`, `data:`, `vbscript:` et autres schémas dangereux.
 */
function isValidLinkUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true; // null/empty est acceptable
  // Chemin relatif ou ancre
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  // URL absolue : whitelist de protocoles
  return /^(https?|mailto|tel):/i.test(trimmed);
}

function validate(input: BannerInput): string | null {
  if (!input.title.trim()) return "Le titre est requis";
  if (!ALLOWED_PLACEMENTS.includes(input.placement)) {
    return `Emplacement invalide : ${input.placement}`;
  }
  if (input.linkUrl && !isValidLinkUrl(input.linkUrl)) {
    return "URL de lien invalide (doit commencer par /, http://, https://, mailto: ou tel:)";
  }
  if (input.startsAt && input.endsAt) {
    const start = Date.parse(input.startsAt);
    const end = Date.parse(input.endsAt);
    if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
      return "La date de fin doit être postérieure à la date de début";
    }
  }
  return null;
}

function revalidateAll() {
  revalidatePath("/admin/bannieres");
  revalidatePath("/");
  revalidatePath("/boutique");
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

  // Lecture de l'ancienne image_url pour cleanup blob si remplacée
  const { data: existing } = await admin
    .from("banners")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

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

  // Si l'ancienne image_url existait et a été remplacée par une autre URL,
  // on supprime l'ancienne du Storage pour éviter une fuite de blobs.
  if (
    existing?.image_url &&
    existing.image_url !== input.imageUrl
  ) {
    await cleanupManagedUrlsServer(admin.storage, [existing.image_url]);
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteBanner(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminRole();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("banners")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await admin.from("banners").delete().eq("id", id);
  if (error) {
    console.error("[deleteBanner]", error);
    return { ok: false, error: "Erreur de suppression" };
  }
  await cleanupManagedUrlsServer(admin.storage, [existing?.image_url]);
  revalidateAll();
  return { ok: true };
}
