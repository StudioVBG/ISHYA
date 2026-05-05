import type { NextRequest } from "next/server";

export type CronAuthResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export function requireCronAuth(request: NextRequest): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (!cronSecret) {
    if (isProd) {
      return {
        ok: false,
        status: 503,
        message: "CRON_SECRET non configuré (requis en production).",
      };
    }
    return { ok: true };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
  return { ok: true };
}
