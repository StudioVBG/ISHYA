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

/** Palette ISHYA */
export const colors = {
  terracotta: "#DF887B",
  beigeNude: "#F2D7C2",
  ivory: "#F8F6F2",
  gold: "#C5A572",
  black: "#000000",
  textMuted: "#4a4a4a",
} as const;

export const fontDisplay = "'Playfair Display', Georgia, 'Times New Roman', serif";
export const fontBody = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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
  /* Les emails HTML ne passent pas par _document Next — chargement Playfair pour clients qui supportent <link>. */
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font -- modèles React Email uniquement
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
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
    <Section style={{ textAlign: "center", padding: "28px 24px 8px" }}>
      <Link href={baseUrl} style={{ textDecoration: "none" }}>
        <Img
          src={src}
          width={140}
          height="auto"
          alt="ISHYA — Bijoux floraux"
          style={{ margin: "0 auto", display: "block" }}
        />
      </Link>
      <Text
        style={{
          margin: "12px 0 0",
          fontFamily: fontDisplay,
          fontSize: "11px",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: colors.black,
        }}
      >
        Création florale
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
        padding: "32px 24px 40px",
        backgroundColor: colors.black,
      }}
    >
      <Text
        style={{
          margin: "0 0 16px",
          fontFamily: fontBody,
          fontSize: "12px",
          lineHeight: "20px",
          color: colors.beigeNude,
          textAlign: "center",
        }}
      >
        {ISHYA_ADDRESS}
      </Text>
      <Row style={{ marginBottom: "16px" }}>
        <Column align="center">
          <Link
            href="https://instagram.com"
            style={{
              color: colors.terracotta,
              fontFamily: fontBody,
              fontSize: "12px",
              margin: "0 10px",
              textDecoration: "underline",
            }}
          >
            Instagram
          </Link>
          <Link
            href="https://pinterest.com"
            style={{
              color: colors.terracotta,
              fontFamily: fontBody,
              fontSize: "12px",
              margin: "0 10px",
              textDecoration: "underline",
            }}
          >
            Pinterest
          </Link>
          <Link
            href="https://facebook.com"
            style={{
              color: colors.terracotta,
              fontFamily: fontBody,
              fontSize: "12px",
              margin: "0 10px",
              textDecoration: "underline",
            }}
          >
            Facebook
          </Link>
          <Link
            href="mailto:contact@ishya.fr"
            style={{
              color: colors.terracotta,
              fontFamily: fontBody,
              fontSize: "12px",
              margin: "0 10px",
              textDecoration: "underline",
            }}
          >
            Email
          </Link>
        </Column>
      </Row>
      <Hr style={{ borderColor: "rgba(242,215,194,0.25)", margin: "0 0 16px" }} />
      <Text
        style={{
          margin: 0,
          fontFamily: fontBody,
          fontSize: "11px",
          lineHeight: "18px",
          color: "rgba(248,246,242,0.55)",
          textAlign: "center",
        }}
      >
        <Link
          href={unsubscribeUrl}
          style={{ color: colors.ivory, textDecoration: "underline" }}
        >
          Se désabonner des emails marketing
        </Link>
        {" · "}
        <Link href={`${baseUrl}/confidentialite`} style={{ color: colors.ivory, textDecoration: "underline" }}>
          Confidentialité
        </Link>
      </Text>
      <Text
        style={{
          margin: "12px 0 0",
          fontFamily: fontBody,
          fontSize: "10px",
          color: "rgba(248,246,242,0.4)",
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} ISHYA — Bijoux artisanaux, fleurs séchées & résine
      </Text>
    </Section>
  );
}

export const ctaButtonStyle: CSSProperties = {
  backgroundColor: colors.terracotta,
  color: "#ffffff",
  fontFamily: fontBody,
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "14px 28px",
  borderRadius: "6px",
};
