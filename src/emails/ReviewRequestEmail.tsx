import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
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

export interface ReviewRequestEmailProps {
  productName: string;
  productImageUrl: string;
  reviewUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const reviewRequestEmailSubject = "Comment avez-vous trouvé vos bijoux ISHYA ?";

function StarRow() {
  const star = "★";
  return (
    <Text
      style={{
        margin: "0 0 20px",
        fontSize: "28px",
        lineHeight: "32px",
        letterSpacing: "4px",
        color: colors.gold,
        textAlign: "center",
      }}
    >
      {star}
      {star}
      {star}
      {star}
      {star}
    </Text>
  );
}

export function ReviewRequestEmail({
  productName,
  productImageUrl,
  reviewUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: ReviewRequestEmailProps) {
  const previewText = `Votre avis compte énormément — +20 points fidélité après publication.`;

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
                fontSize: "24px",
                lineHeight: "32px",
                fontWeight: 600,
                color: colors.black,
                margin: "0 0 16px",
                textAlign: "center",
              }}
            >
              Comment avez-vous trouvé vos bijoux ISHYA ?
            </Heading>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.textMuted, margin: "0 0 20px", textAlign: "center" }}>
              Votre ressenti nous aide à perfectionner chaque collection. Une minute suffit pour partager votre expérience
              sur <strong style={{ color: colors.black }}>{productName}</strong>.
            </Text>

            <Section style={{ textAlign: "center", marginBottom: "12px" }}>
              <Img
                src={productImageUrl}
                alt={productName}
                width={200}
                height={200}
                style={{
                  borderRadius: "8px",
                  border: `1px solid ${colors.beigeNude}`,
                  display: "inline-block",
                }}
              />
            </Section>

            <StarRow />

            <Section
              style={{
                backgroundColor: colors.beigeNude,
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "24px",
              }}
            >
              <Text style={{ margin: 0, fontSize: "14px", lineHeight: "22px", color: colors.black, textAlign: "center" }}>
                <strong>+20 points fidélité</strong> offerts lorsque votre avis est publié. Merci de soutenir notre
                atelier artisanal.
              </Text>
            </Section>

            <Row>
              <Column align="center">
                <Button href={reviewUrl} style={ctaButtonStyle}>
                  Laisser un avis
                </Button>
              </Column>
            </Row>

            <Hr style={{ borderColor: colors.beigeNude, margin: "32px 0 20px" }} />
            <Text style={{ fontSize: "13px", lineHeight: "22px", color: colors.textMuted, margin: 0, textAlign: "center" }}>
              <Link href={`${baseUrl}/compte/avis`} style={{ color: colors.terracotta }}>
                Voir mes commandes
              </Link>
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
