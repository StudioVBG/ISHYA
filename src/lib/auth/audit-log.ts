import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "insert"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "approve"
  | "reject"
  | "publish"
  | "unpublish"
  | "assign"
  | "refund"
  | "ship"
  | "status_change";

export interface AuditEvent {
  userId: string | null;
  action: AuditAction | string;
  tableName: string | null;
  recordId?: string | null;
  oldData?: unknown;
  newData?: unknown;
}

async function readClientIp(): Promise<string | null> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null
    );
  } catch {
    return null;
  }
}

async function readUserAgent(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("user-agent");
  } catch {
    return null;
  }
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const admin = createAdminClient();
  const [ip, userAgent] = await Promise.all([readClientIp(), readUserAgent()]);

  const { error } = await admin.from("audit_logs").insert({
    user_id: event.userId,
    action: event.action,
    table_name: event.tableName,
    record_id: event.recordId ?? null,
    old_data: (event.oldData ?? null) as never,
    new_data: (event.newData ?? null) as never,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    console.error("[logAuditEvent]", error);
  }
}
