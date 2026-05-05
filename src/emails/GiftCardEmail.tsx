import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
  Heading,
  Button,
} from "@react-email/components";
import {
  colors,
  fontBody,
  fontDisplay,
  formatEur,
  EmailHeadFonts,
  EmailHeader,
  EmailFooter,
  ctaButtonStyle,
} from "./shared";

export interface GiftCardEmailProps {
  recipientName?: string | null;
  senderName?: string | null;
  amount: number;
  code: string;
  message?: string | null;
  shopUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const giftCardEmailSubject = (senderName?: string | null) =>
  senderName ? `Une carte cadeau ISHYA de ${senderName}` : "Votre carte cadeau ISHYA";

export function GiftCardEmail({
  recipientName,
  senderName,
  amount,
  code,
  message,
  shopUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: GiftCardEmailProps) {
  const greeting = recipientName ? `Bonjour ${recipientName},` : "Bonjour,";
  const previewText = senderName
    ? `${senderName} vous offre une carte cadeau ISHYA de ${formatEur(amount)}.`
    : `Vous avez reçu une carte cadeau ISHYA de ${formatEur(amount)}.`;

  return (
    <Html lang="fr">
      <Head>
        <EmailHeadFonts />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ margin: 0, backgroundColor: colors.ivory, fontFamily: fontBody }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: colors.ivory }}>
          <EmailHeader baseUrl={baseUrl} logoSrc={logoSrc} />
          <Section style={{ padding: "8px 32px 32px" }}>
            <Heading
              as="h1"
              style={{
                fontFamily: fontDisplay,
                fontSize: "28px",
                lineHeight: "36px",
                fontWeight: 600,
                color: colors.black,
                margin: "0 0 20px",
              }}
            >
              Une attention pour vous
            </Heading>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.textMuted, margin: "0 0 16px" }}>
              {greeting}
            </Text>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.textMuted, margin: "0 0 24px" }}>
              {senderName ? (
                <>
                  <strong style={{ color: colors.black }}>{senderName}</strong> vous offre une
                  carte cadeau ISHYA pour explorer notre univers de bijoux floraux artisanaux.
                </>
              ) : (
                <>Vous avez reçu une carte cadeau ISHYA. À utiliser sur votre prochaine commande.</>
              )}
            </Text>

            <Section
              style={{
                backgroundColor: colors.beigeNude,
                borderRadius: "8px",
                padding: "28px 24px",
                textAlign: "center",
                border: `1px solid ${colors.gold}`,
              }}
            >
              <Text
                style={{
                  margin: "0 0 8px",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: colors.textMuted,
                }}
              >
                Montant
              </Text>
              <Text
                style={{
                  margin: "0 0 16px",
                  fontFamily: fontDisplay,
                  fontSize: "36px",
                  fontWeight: 700,
                  color: colors.black,
                  letterSpacing: "0.04em",
                }}
              >
                {formatEur(amount)}
              </Text>
              <Hr style={{ borderColor: colors.gold, margin: "16px 0" }} />
              <Text
                style={{
                  margin: "0 0 6px",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: colors.textMuted,
                }}
              >
                Code à utiliser au paiement
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: fontDisplay,
                  fontSize: "22px",
                  fontWeight: 700,
                  color: colors.black,
                  letterSpacing: "0.16em",
                }}
              >
                {code}
              </Text>
            </Section>

            {message ? (
              <Section
                style={{
                  marginTop: "28px",
                  padding: "20px 24px",
                  backgroundColor: "#FFFFFF",
                  borderLeft: `3px solid ${colors.terracotta}`,
                  borderRadius: "4px",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    fontFamily: fontDisplay,
                    fontStyle: "italic",
                    fontSize: "15px",
                    lineHeight: "24px",
                    color: colors.black,
                  }}
                >
                  « {message} »
                </Text>
                {senderName ? (
                  <Text
                    style={{
                      margin: "10px 0 0",
                      fontSize: "13px",
                      color: colors.textMuted,
                      textAlign: "right",
                    }}
                  >
                    — {senderName}
                  </Text>
                ) : null}
              </Section>
            ) : null}

            <Section style={{ textAlign: "center", marginTop: "32px" }}>
              <Button href={shopUrl} style={ctaButtonStyle}>
                Découvrir la boutique
              </Button>
            </Section>

            <Hr style={{ borderColor: colors.beigeNude, margin: "36px 0 24px" }} />
            <Text style={{ fontSize: "12px", lineHeight: "20px", color: colors.textMuted, margin: 0 }}>
              Carte cadeau valable 1 an. Utilisable en plusieurs fois jusqu&apos;à épuisement du
              solde. Une question ?{" "}
              <Link href="mailto:contact@ishya.fr" style={{ color: colors.terracotta }}>
                contact@ishya.fr
              </Link>
              .
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
