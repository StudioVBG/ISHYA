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

export const ABANDONED_CART_CODE = "REVIENS10";

export interface AbandonedCartEmail3Props {
  products: AbandonedCartProduct[];
  promoUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const abandonedCartEmail3Subject = "Un petit cadeau pour vous : -10% exclusif";

export function AbandonedCartEmail3({
  products,
  promoUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: AbandonedCartEmail3Props) {
  const previewText = `Code ${ABANDONED_CART_CODE} : -10 % pendant 48 h uniquement. Vos bijoux ISHYA vous attendent. Envoyé 72 h après.`;

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
              }}
            >
              Un petit cadeau pour vous : -10 % exclusif
            </Heading>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.textMuted, margin: "0 0 20px" }}>
              Nous avons gardé une place pour vous. Pendant <strong>48 heures</strong>, profitez de{" "}
              <strong>-10 %</strong> sur votre commande avec le code ci-dessous — une attention de notre atelier pour
              vous dire à quel point vos bijoux floraux méritent de vous accompagner.
            </Text>

            <Section
              style={{
                backgroundColor: colors.beigeNude,
                borderRadius: "8px",
                padding: "22px",
                textAlign: "center",
                border: `2px dashed ${colors.terracotta}`,
                marginBottom: "28px",
              }}
            >
              <Text
                style={{
                  margin: "0 0 8px",
                  fontSize: "12px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: colors.textMuted,
                }}
              >
                Code valable 48 h
              </Text>
              <Text
                style={{
                  margin: "0 0 8px",
                  fontFamily: fontDisplay,
                  fontSize: "28px",
                  fontWeight: 700,
                  color: colors.black,
                  letterSpacing: "0.1em",
                }}
              >
                {ABANDONED_CART_CODE}
              </Text>
              <Text style={{ margin: 0, fontSize: "13px", color: colors.textMuted }}>
                -10 % sur votre panier — offre personnelle, non cumulable
              </Text>
            </Section>

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
                          border: `1px solid ${colors.beigeNude}`,
                        }}
                      />
                      <Text
                        style={{
                          margin: "10px 0 4px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: colors.black,
                        }}
                      >
                        {p.name}
                      </Text>
                      {p.price != null && (
                        <Text style={{ margin: 0, fontSize: "13px", color: colors.gold, fontWeight: 600 }}>
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
              <Button href={promoUrl} style={ctaButtonStyle}>
                Profiter de -10 %
              </Button>
            </Section>

            <Hr style={{ borderColor: colors.beigeNude, margin: "32px 0 20px" }} />
            <Text style={{ fontSize: "12px", lineHeight: "18px", color: colors.textMuted, margin: 0 }}>
              Ce message est envoyé 72 h après l&apos;abandon de panier. Le code expire après 48 h.
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
