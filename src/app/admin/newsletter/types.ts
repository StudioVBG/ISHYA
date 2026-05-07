export interface NewsletterRow {
  id: string;
  email: string;
  source: string | null;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  unsubscribeReason: string | null;
  confirmedAt: string | null;
  marketingConsent: boolean;
  bounceCount: number;
  lastBouncedAt: string | null;
  lastBounceType: string | null;
  lastBounceReason: string | null;
}

export interface NewsletterPageResult {
  rows: NewsletterRow[];
  /** Cursor opaque pour la page suivante. `null` si dernière page. */
  nextCursor: string | null;
  /** Compte total (présent uniquement quand on le demande explicitement). */
  total?: number;
}

/**
 * Cursor format : `<subscribed_at ISO>|<id>` — encode le couple
 * (timestamp, id) pour disambiguer les égalités de timestamp et garantir
 * 0 doublon entre pages.
 */
export function encodeCursor(subscribedAt: string, id: string): string {
  return `${subscribedAt}|${id}`;
}

export function decodeCursor(cursor: string): { subscribedAt: string; id: string } | null {
  const idx = cursor.indexOf("|");
  if (idx === -1) return null;
  return {
    subscribedAt: cursor.slice(0, idx),
    id: cursor.slice(idx + 1),
  };
}
