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

export interface WelcomeEmailProps {
  firstName: string;
  baseUrl: string;
  shopUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const welcomeEmailSubject =
  "Bienvenue chez ISHYA ! Votre code -10% vous attend";

export function WelcomeEmail({
  firstName,
  baseUrl,
  shopUrl,
  unsubscribeUrl,
  logoSrc,
}: WelcomeEmailProps) {
  const previewText = `Bienvenue ${firstName} — découvrez nos bijoux floraux et votre code BIENVENUE10.`;

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
              Bienvenue {firstName} !
            </Heading>
            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.textMuted,
                margin: "0 0 16px",
              }}
            >
              Nous sommes ravis de vous accueillir chez ISHYA. Notre maison imagine des bijoux
              uniques où fleurs séchées et pétales précieux sont capturés dans une résine
              cristalline — une parenthèse de nature à porter sur la peau.
            </Text>
            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.textMuted,
                margin: "0 0 28px",
              }}
            >
              Pour célébrer votre inscription, voici un geste tout en douceur :{" "}
              <strong style={{ color: colors.black }}>-10 % sur votre première commande</strong>.
            </Text>

            <Section
              style={{
                backgroundColor: colors.beigeNude,
                borderRadius: "8px",
                padding: "24px",
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
                Votre code exclusif
              </Text>
              <Text
                style={{
                  margin: "0 0 4px",
                  fontFamily: fontDisplay,
                  fontSize: "26px",
                  fontWeight: 700,
                  color: colors.black,
                  letterSpacing: "0.08em",
                }}
              >
                BIENVENUE10
              </Text>
              <Text style={{ margin: 0, fontSize: "13px", color: colors.textMuted }}>
                -10 % valable sur votre première commande
              </Text>
            </Section>

            <Section style={{ textAlign: "center", marginTop: "32px" }}>
              <Button href={shopUrl} style={ctaButtonStyle}>
                Découvrir la boutique
              </Button>
            </Section>

            <Row style={{ marginTop: "28px" }}>
              <Column style={{ width: "50%", paddingRight: "8px", verticalAlign: "top" }}>
                <Text style={{ fontSize: "13px", lineHeight: "20px", color: colors.textMuted, margin: 0 }}>
                  <strong style={{ color: colors.black }}>Fait main</strong> en France, pièces uniques ou petites séries.
                </Text>
              </Column>
              <Column style={{ width: "50%", paddingLeft: "8px", verticalAlign: "top" }}>
                <Text style={{ fontSize: "13px", lineHeight: "20px", color: colors.textMuted, margin: 0 }}>
                  <strong style={{ color: colors.black }}>Emballage soigné</strong> pour offrir ou se faire plaisir.
                </Text>
              </Column>
            </Row>

            <Hr style={{ borderColor: colors.beigeNude, margin: "36px 0 24px" }} />
            <Text style={{ fontSize: "13px", lineHeight: "22px", color: colors.textMuted, margin: 0 }}>
              Une question ? Écrivez-nous à{" "}
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
