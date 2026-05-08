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

export interface RestockEmailProps {
  productName: string;
  productImageUrl: string;
  productUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export function restockEmailSubject(productName: string) {
  return `Bonne nouvelle ! ${productName} est de retour`;
}

export function RestockEmail({
  productName,
  productImageUrl,
  productUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: RestockEmailProps) {
  const previewText = `${productName} est de nouveau disponible — stock limité. C'était dans vos favoris.`;

  return (
    <Html lang="fr">
      <Head>
        <EmailHeadFonts />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ margin: 0, backgroundColor: colors.bone, fontFamily: fontBody }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: colors.bone }}>
          <EmailHeader baseUrl={baseUrl} logoSrc={logoSrc} />
          <Section style={{ padding: "8px 32px 32px" }}>
            <Section
              style={{
                backgroundColor: colors.ink,
                color: colors.bone,
                padding: "10px 14px",
                borderRadius: "6px",
                textAlign: "center",
                marginBottom: "18px",
              }}
            >
              <Text style={{ margin: 0, fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" }}>
                Stock limité
              </Text>
            </Section>
            <Heading
              as="h1"
              style={{
                fontFamily: fontDisplay,
                fontSize: "24px",
                lineHeight: "32px",
                fontWeight: 600,
                color: colors.ink,
                margin: "0 0 12px",
              }}
            >
              Bonne nouvelle ! {productName} est de retour
            </Heading>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.steel, margin: "0 0 8px" }}>
              C&apos;était dans vos favoris — cette pièce tant aimée vient de revenir en boutique. Les quantités restent
              modestes : ne la laissez pas s&apos;envoler une seconde fois.
            </Text>

            <Section style={{ textAlign: "center", margin: "24px 0" }}>
              <Link href={productUrl} style={{ textDecoration: "none" }}>
                <Img
                  src={productImageUrl}
                  alt={productName}
                  width={320}
                  height={320}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "10px",
                    border: `1px solid ${colors.boneSoft}`,
                    display: "inline-block",
                  }}
                />
              </Link>
            </Section>

            <Text
              style={{
                fontFamily: fontDisplay,
                fontSize: "20px",
                fontWeight: 600,
                color: colors.ink,
                textAlign: "center",
                margin: "0 0 24px",
              }}
            >
              {productName}
            </Text>

            <Section style={{ textAlign: "center" }}>
              <Button href={productUrl} style={ctaButtonStyle}>
                Ajouter au panier
              </Button>
            </Section>

            <Hr style={{ borderColor: colors.boneSoft, margin: "32px 0 20px" }} />
            <Text style={{ fontSize: "13px", lineHeight: "22px", color: colors.steel, margin: 0 }}>
              Découvrez aussi les{" "}
              <Link href={`${baseUrl}/nouveautes`} style={{ color: colors.ember }}>
                nouveautés
              </Link>{" "}
              de la saison.
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
