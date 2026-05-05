import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/supabase";

// Idempotence des emails transactionnels via la table email_logs (migration 006).
// La clé de déduplication doit être stable et unique pour la fenêtre voulue
// (ex : "birthday:USER_ID:2026" → 1 envoi par an et par utilisateur).

export interface LogEmailParams {
  email: string;
  emailType: string;
  dedupKey: string;
  userId?: string | null;
  metadata?: Record<string, Json>;
}

export async function hasEmailBeenSent(
  emailType: string,
  dedupKey: string,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("email_logs")
    .select("id")
    .eq("email_type", emailType)
    .eq("dedup_key", dedupKey)
    .maybeSingle();

  if (error) {
    console.error("[email-logs] hasEmailBeenSent error:", error);
    return false;
  }
  return Boolean(data);
}

export async function logEmailSent(params: LogEmailParams): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("email_logs").insert({
    email: params.email,
    email_type: params.emailType,
    dedup_key: params.dedupKey,
    user_id: params.userId ?? null,
    metadata: (params.metadata ?? null) as Json | null,
  });

  if (error && error.code !== "23505") {
    console.error("[email-logs] logEmailSent error:", error);
  }
}
