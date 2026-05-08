import type { CSSProperties } from "react";
import {
  Section,
  Text,
  Link,
  Img,
  Hr,
  Row,
  Column,
} from "@react-email/components";

/**
 * Palette ISHYA — direction artistique « Atelier Noir » (mai 2026).
 * Les emails ne supportant pas les variables CSS ni OKLCH côté client mail,
 * on utilise des équivalents hex sRGB des couleurs OKLCH P3 du storefront.
 * Les anciens noms (terracotta, gold, beigeNude, ivory, black, textMuted)
 * sont conservés en alias pour ne casser aucun template existant.
 */
export const colors = {
  // ─── Atelier Noir (signature 2026) ─────────────────────────────
  ink: "#1A1D24", // onyx anti-warm (≈ oklch 0.15 0.005 270)
  bone: "#F5F1E8", // blanc os anti-cream (≈ oklch 0.96 0.008 85)
  boneSoft: "#ECE5D5", // bone discret pour cards (≈ oklch 0.93 0.012 85)
  leather: "#6E4528", // cuir tabac (≈ oklch 0.42 0.085 45)
  ember: "#C47C40", // cuivre patiné — accent CTA (≈ oklch 0.62 0.14 50)
  emberBright: "#D88F49", // ember hover (≈ oklch 0.70 0.16 55)
  emberDeep: "#A66833", // ember pressed (≈ oklch 0.50 0.13 48)
  steel: "#7B7E8A", // gris froid métadonnées (≈ oklch 0.55 0.012 250)
  steelSoft: "#BABCC4", // steel clair, dividers
  // ─── Alias rétrocompat ───────────────────────────────────────
  terracotta: "#C47C40", // → ember
  beigeNude: "#ECE5D5", // → boneSoft
  ivory: "#F5F1E8", // → bone
  gold: "#C47C40", // → ember
  black: "#1A1D24", // → ink (warm, not pure black)
  textMuted: "#7B7E8A", // → steel
} as const;

/** Police display (titres) — Fraunces variable, latin-ext */
export const fontDisplay =
  "'Fraunces', 'Times New Roman', Georgia, serif";

/**
 * Police de corps — Bricolage Grotesque (CDN) avec fallbacks robustes
 * pour les clients mail qui ne chargent pas les fontes externes (Outlook,
 * certains clients d'entreprise) : on retombe sur la system-ui native.
 */
export const fontBody =
  "'Bricolage Grotesque', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const fontMono =
  "'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export function getEmailBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "https://ishya.fr";
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

const ISHYA_ADDRESS = "ISHYA — 12 Rue de la Paix, 75002 Paris, France";

export function EmailHeadFonts() {
  /* Chargement Google Fonts dans <head> pour les clients mail qui supportent
     les <link> externes (Apple Mail, Gmail web, Yahoo). Sinon fallback
     system-ui via fontBody. */
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- modèles React Email uniquement */}
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..700,0..100,0..1&family=Bricolage+Grotesque:opsz,wght@12..96,300..700&family=Geist+Mono:wght@400..600&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

export function EmailHeader({
  baseUrl,
  logoSrc,
}: {
  baseUrl: string;
  logoSrc?: string;
}) {
  const src = logoSrc ?? `${baseUrl}/logo.png`;
  return (
    <Section
      style={{
        textAlign: "center",
        padding: "32px 24px 12px",
        backgroundColor: colors.bone,
      }}
    >
      <Link href={baseUrl} style={{ textDecoration: "none" }}>
        <Img
          src={src}
          width={120}
          height="auto"
          alt="ISHYA — Bijoux floraux"
          style={{ margin: "0 auto", display: "block" }}
        />
      </Link>
      <Text
        style={{
          margin: "16px 0 0",
          fontFamily: fontMono,
          fontSize: "10px",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: colors.steel,
        }}
      >
        Maison · Paris
      </Text>
    </Section>
  );
}

export function EmailFooter({
  baseUrl,
  unsubscribeUrl,
}: {
  baseUrl: string;
  unsubscribeUrl: string;
}) {
  return (
    <Section
      style={{
        padding: "40px 24px 48px",
        backgroundColor: colors.ink,
      }}
    >
      <Text
        style={{
          margin: "0 0 20px",
          fontFamily: fontMono,
          fontSize: "10px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          lineHeight: "20px",
          color: "rgba(245, 241, 232, 0.5)",
          textAlign: "center",
        }}
      >
        {ISHYA_ADDRESS}
      </Text>
      <Row style={{ marginBottom: "20px" }}>
        <Column align="center">
          <Link
            href="https://instagram.com"
            style={{
              color: colors.ember,
              fontFamily: fontMono,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              margin: "0 12px",
              textDecoration: "none",
            }}
          >
            Instagram
          </Link>
          <Link
            href="https://pinterest.com"
            style={{
              color: colors.ember,
              fontFamily: fontMono,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              margin: "0 12px",
              textDecoration: "none",
            }}
          >
            Pinterest
          </Link>
          <Link
            href="https://facebook.com"
            style={{
              color: colors.ember,
              fontFamily: fontMono,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              margin: "0 12px",
              textDecoration: "none",
            }}
          >
            Facebook
          </Link>
          <Link
            href="mailto:contact@ishya.fr"
            style={{
              color: colors.ember,
              fontFamily: fontMono,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              margin: "0 12px",
              textDecoration: "none",
            }}
          >
            Email
          </Link>
        </Column>
      </Row>
      <Hr
        style={{
          borderColor: "rgba(245, 241, 232, 0.12)",
          margin: "0 0 20px",
        }}
      />
      <Text
        style={{
          margin: 0,
          fontFamily: fontMono,
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          lineHeight: "18px",
          color: "rgba(245, 241, 232, 0.45)",
          textAlign: "center",
        }}
      >
        <Link
          href={unsubscribeUrl}
          style={{
            color: colors.bone,
            textDecoration: "none",
          }}
        >
          Se désabonner
        </Link>
        {" · "}
        <Link
          href={`${baseUrl}/confidentialite`}
          style={{ color: colors.bone, textDecoration: "none" }}
        >
          Confidentialité
        </Link>
      </Text>
      <Text
        style={{
          margin: "16px 0 0",
          fontFamily: fontMono,
          fontSize: "9px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(245, 241, 232, 0.35)",
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} ISHYA · Bijoux artisanaux · fleurs séchées
        & résine
      </Text>
    </Section>
  );
}

export const ctaButtonStyle: CSSProperties = {
  backgroundColor: colors.ink,
  color: colors.bone,
  fontFamily: fontMono,
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "16px 32px",
  borderRadius: "4px",
};

export const ctaButtonEmberStyle: CSSProperties = {
  ...ctaButtonStyle,
  backgroundColor: colors.ember,
  color: colors.bone,
};
