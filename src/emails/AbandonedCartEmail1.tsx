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

export interface AbandonedCartProduct {
  name: string;
  imageUrl: string;
  productUrl: string;
  price?: number;
}

export interface AbandonedCartEmail1Props {
  products: AbandonedCartProduct[];
  cartUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const abandonedCartEmail1Subject = "Vous avez oublié quelque chose...";

export function AbandonedCartEmail1({
  products,
  cartUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: AbandonedCartEmail1Props) {
  const previewText =
    "Votre panier ISHYA vous attend — retrouvez vos bijoux floraux en un clic. Envoyé 1 h après votre visite.";

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
              Vous avez oublié quelque chose...
            </Heading>
            <Text style={{ fontSize: "14px", lineHeight: "22px", color: colors.steel, margin: "0 0 8px" }}>
              Il y a environ une heure, vous avez laissé ces trésors dans votre panier. Ils sont toujours réservés pour
              vous, le temps de finaliser votre commande.
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
              <Button href={cartUrl} style={ctaButtonStyle}>
                Retrouver mon panier
              </Button>
            </Section>

            <Hr style={{ borderColor: colors.boneSoft, margin: "32px 0 20px" }} />
            <Text style={{ fontSize: "12px", lineHeight: "18px", color: colors.steel, margin: 0 }}>
              Cet email est envoyé automatiquement environ 1 h après l&apos;abandon de panier.
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
