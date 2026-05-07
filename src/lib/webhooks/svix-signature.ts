import crypto from "node:crypto";

/**
 * Vérification de la signature Svix utilisée par Resend (et d'autres
 * fournisseurs de webhooks).
 *
 * Format des headers :
 *   svix-id        : msg_xxx (identifiant unique du message)
 *   svix-timestamp : timestamp Unix en secondes (anti-replay)
 *   svix-signature : v1,<sig1> v1,<sig2> ... (potentiellement plusieurs)
 *
 * Algo : HMAC-SHA256 sur `${id}.${timestamp}.${body}`, encodé en base64,
 * comparé en time-constant.
 *
 * @returns `null` si valide, sinon une raison d'échec.
 */
export function verifySvixSignature({
  body,
  headers,
  secret,
  toleranceSeconds = 300, // 5min — fenêtre standard Svix
}: {
  body: string;
  headers: {
    "svix-id"?: string | null;
    "svix-timestamp"?: string | null;
    "svix-signature"?: string | null;
  };
  secret: string;
  toleranceSeconds?: number;
}): string | null {
  const id = headers["svix-id"];
  const timestamp = headers["svix-timestamp"];
  const signature = headers["svix-signature"];

  if (!id || !timestamp || !signature) {
    return "missing-headers";
  }

  // Anti-replay : refuse les messages trop anciens
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return "invalid-timestamp";
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSeconds) {
    return "timestamp-out-of-tolerance";
  }

  // Le secret Svix est de la forme "whsec_<base64>" — on doit décoder
  const secretRaw = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice("whsec_".length), "base64")
    : Buffer.from(secret, "utf-8");

  // Calcule la signature attendue
  const signedPayload = `${id}.${timestamp}.${body}`;
  const expected = crypto
    .createHmac("sha256", secretRaw)
    .update(signedPayload)
    .digest("base64");

  // Le header peut contenir plusieurs signatures séparées par espace,
  // chacune préfixée de "v1,"
  const candidates = signature
    .split(" ")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("v1,"))
    .map((s) => s.slice("v1,".length));

  if (candidates.length === 0) return "no-v1-signature";

  // Comparaison time-constant pour chaque candidate
  for (const candidate of candidates) {
    if (candidate.length !== expected.length) continue;
    const a = Buffer.from(candidate, "base64");
    const b = Buffer.from(expected, "base64");
    if (a.length !== b.length) continue;
    if (crypto.timingSafeEqual(a, b)) return null;
  }

  return "signature-mismatch";
}
