/**
 * Composant utilitaire pour injecter du JSON-LD (schema.org) côté serveur.
 * `data` est sérialisé une seule fois via JSON.stringify ; on échappe `<` pour
 * éviter toute injection de balise.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.ishya.fr");
  return url.replace(/\/$/, "");
}
