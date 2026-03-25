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
  Row,
  Column,
} from "@react-email/components";
import {
  colors,
  fontBody,
  fontDisplay,
  EmailHeadFonts,
  EmailHeader,
  EmailFooter,
  ctaButtonStyle,
} from "./shared";

export interface BirthdayEmailProps {
  firstName: string;
  discountCode: string;
  giftIdeasUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export function birthdayEmailSubject(firstName: string) {
  return `Joyeux anniversaire ${firstName} ! Un cadeau vous attend`;
}

export function BirthdayEmail({
  firstName,
  discountCode,
  giftIdeasUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: BirthdayEmailProps) {
  const previewText = `Joyeux anniversaire ${firstName} — un code cadeau ISHYA vous attend.`;

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
            <Text style={{ fontSize: "42px", lineHeight: "48px", textAlign: "center", margin: "0 0 8px" }}>🎁</Text>
            <Heading
              as="h1"
              style={{
                fontFamily: fontDisplay,
                fontSize: "28px",
                lineHeight: "36px",
                fontWeight: 600,
                color: colors.black,
                margin: "0 0 16px",
                textAlign: "center",
              }}
            >
              Joyeux anniversaire {firstName} !
            </Heading>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.textMuted, margin: "0 0 20px", textAlign: "center" }}>
              Toute l&apos;équipe ISHYA vous souhaite une journée lumineuse. Pour fêter ça avec vous, nous avons préparé
              une surprise tout en délicatesse — comme nos bijoux floraux.
            </Text>

            <Section
              style={{
                backgroundColor: colors.beigeNude,
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                border: `1px solid ${colors.gold}`,
                marginBottom: "28px",
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
                Votre code anniversaire unique
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: fontDisplay,
                  fontSize: "26px",
                  fontWeight: 700,
                  color: colors.black,
                  letterSpacing: "0.06em",
                }}
              >
                {discountCode}
              </Text>
            </Section>

            <Heading
              as="h2"
              style={{
                fontFamily: fontDisplay,
                fontSize: "18px",
                fontWeight: 600,
                color: colors.black,
                margin: "0 0 12px",
                textAlign: "center",
              }}
            >
              Idées cadeaux
            </Heading>
            <Text style={{ fontSize: "14px", lineHeight: "22px", color: colors.textMuted, margin: "0 0 24px", textAlign: "center" }}>
              Colliers de fleurs séchées, bagues résine, bracelets poétiques… Laissez-vous guider par notre sélection
              pour un présent inoubliable.
            </Text>

            <Row>
              <Column align="center">
                <Button href={giftIdeasUrl} style={ctaButtonStyle}>
                  Choisir mon cadeau
                </Button>
              </Column>
            </Row>

            <Hr style={{ borderColor: colors.beigeNude, margin: "32px 0 20px" }} />
            <Text style={{ fontSize: "13px", lineHeight: "22px", color: colors.textMuted, margin: 0, textAlign: "center" }}>
              Des questions sur les tailles ou les matériaux ?{" "}
              <Link href={`${baseUrl}/contact`} style={{ color: colors.terracotta }}>
                Nous sommes là
              </Link>
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
