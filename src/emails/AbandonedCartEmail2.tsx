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
  formatEur,
} from "./shared";
import type { AbandonedCartProduct } from "./AbandonedCartEmail1";

export interface AbandonedCartEmail2Props {
  products: AbandonedCartProduct[];
  checkoutUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const abandonedCartEmail2Subject = "Vos bijoux vous attendent !";

export function AbandonedCartEmail2({
  products,
  checkoutUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: AbandonedCartEmail2Props) {
  const previewText =
    "Stock limité : vos pièces ISHYA favorites sont encore disponibles. Complétez votre commande. Envoyé 24 h après.";

  const rows: AbandonedCartProduct[][] = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(products.slice(i, i + 2));
  }

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
                padding: "12px 16px",
                borderRadius: "6px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <Text style={{ margin: 0, fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Stock limité
              </Text>
            </Section>
            <Heading
              as="h1"
              style={{
                fontFamily: fontDisplay,
                fontSize: "26px",
                lineHeight: "34px",
                fontWeight: 600,
                color: colors.ink,
                margin: "0 0 12px",
              }}
            >
              Vos bijoux vous attendent !
            </Heading>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.steel, margin: "0 0 16px" }}>
              Nos créations en fleurs séchées et résine sont produites en petites séries. Si un modèle vous a fait
              battre le cœur, ne tardez pas : les stocks fondent vite.
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "22px", color: colors.steel, margin: "0 0 24px" }}>
              Voici un rappel des pièces que vous aviez sélectionnées — elles sont encore dans votre panier.
            </Text>

            {rows.map((pair, rowIndex) => (
              <Row key={rowIndex} style={{ marginBottom: "16px" }}>
                {pair.map((p, colIndex) => (
                  <Column key={colIndex} style={{ width: "50%", paddingRight: colIndex === 0 ? "8px" : "0", paddingLeft: colIndex === 1 ? "8px" : "0", verticalAlign: "top" }}>
                    <Link href={p.productUrl} style={{ textDecoration: "none" }}>
                      <Img
                        src={p.imageUrl}
                        alt={p.name}
                        width={260}
                        height={260}
                        style={{
                          width: "100%",
                          maxWidth: "260px",
                          height: "auto",
                          borderRadius: "8px",
                          display: "block",
                          border: `1px solid ${colors.boneSoft}`,
                        }}
                      />
                      <Text
                        style={{
                          margin: "10px 0 4px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: colors.ink,
                        }}
                      >
                        {p.name}
                      </Text>
                      {p.price != null && (
                        <Text style={{ margin: 0, fontSize: "13px", color: colors.ember, fontWeight: 600 }}>
                          {formatEur(p.price)}
                        </Text>
                      )}
                    </Link>
                  </Column>
                ))}
                {pair.length === 1 && <Column style={{ width: "50%" }} />}
              </Row>
            ))}

            <Section style={{ textAlign: "center", marginTop: "28px" }}>
              <Button href={checkoutUrl} style={ctaButtonStyle}>
                Compléter ma commande
              </Button>
            </Section>

            <Hr style={{ borderColor: colors.boneSoft, margin: "32px 0 20px" }} />
            <Text style={{ fontSize: "12px", lineHeight: "18px", color: colors.steel, margin: 0 }}>
              Rappel envoyé 24 h après l&apos;abandon de panier.
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
