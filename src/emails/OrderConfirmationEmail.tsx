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
  formatEur,
} from "./shared";

export interface OrderLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderConfirmationEmailProps {
  orderNumber: string;
  orderDate: string;
  items: OrderLineItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddressLines: string[];
  trackOrderUrl: string;
  estimatedDelivery: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export function orderConfirmationEmailSubject(orderNumber: string) {
  return `Commande confirmée #${orderNumber}`;
}

export function OrderConfirmationEmail({
  orderNumber,
  orderDate,
  items,
  subtotal,
  shipping,
  discount,
  total,
  shippingAddressLines,
  trackOrderUrl,
  estimatedDelivery,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: OrderConfirmationEmailProps) {
  const previewText = `Votre commande #${orderNumber} est confirmée. Livraison estimée : ${estimatedDelivery}.`;

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
                margin: "0 0 8px",
              }}
            >
              Commande confirmée
            </Heading>
            <Text style={{ fontSize: "15px", color: colors.steel, margin: "0 0 4px" }}>
              <strong style={{ color: colors.ink }}>N° {orderNumber}</strong>
            </Text>
            <Text style={{ fontSize: "14px", color: colors.steel, margin: "0 0 24px" }}>
              Passée le {orderDate}
            </Text>

            <Heading
              as="h2"
              style={{
                fontFamily: fontDisplay,
                fontSize: "18px",
                fontWeight: 600,
                color: colors.ink,
                margin: "0 0 12px",
              }}
            >
              Articles
            </Heading>
            {items.map((item, i) => (
              <Row
                key={i}
                style={{
                  borderBottom: `1px solid ${colors.boneSoft}`,
                  paddingBottom: "12px",
                  marginBottom: "12px",
                }}
              >
                <Column style={{ width: "70%" }}>
                  <Text style={{ margin: 0, fontSize: "14px", color: colors.ink, fontWeight: 600 }}>
                    {item.name}
                  </Text>
                  <Text style={{ margin: "4px 0 0", fontSize: "13px", color: colors.steel }}>
                    Quantité × {item.quantity}
                  </Text>
                </Column>
                <Column align="right" style={{ width: "30%" }}>
                  <Text style={{ margin: 0, fontSize: "14px", color: colors.ink }}>
                    {formatEur(item.unitPrice * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Section style={{ marginTop: "8px", marginBottom: "24px" }}>
              <Row>
                <Column>
                  <Text style={{ margin: "0 0 6px", fontSize: "14px", color: colors.steel }}>Sous-total</Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: "0 0 6px", fontSize: "14px", color: colors.ink }}>{formatEur(subtotal)}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={{ margin: "0 0 6px", fontSize: "14px", color: colors.steel }}>Livraison</Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: "0 0 6px", fontSize: "14px", color: colors.ink }}>{formatEur(shipping)}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={{ margin: "0 0 6px", fontSize: "14px", color: colors.steel }}>Remise</Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: "0 0 6px", fontSize: "14px", color: colors.ink }}>
                    {discount <= 0 ? "—" : `-${formatEur(Math.abs(discount))}`}
                  </Text>
                </Column>
              </Row>
              <Hr style={{ borderColor: colors.ember, margin: "12px 0" }} />
              <Row>
                <Column>
                  <Text style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: colors.ink }}>Total</Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: colors.ink }}>
                    {formatEur(total)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section
              style={{
                backgroundColor: colors.boneSoft,
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <Text
                style={{
                  margin: "0 0 8px",
                  fontFamily: fontDisplay,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: colors.ink,
                }}
              >
                Adresse de livraison
              </Text>
              {shippingAddressLines.map((line, idx) => (
                <Text key={idx} style={{ margin: "0 0 4px", fontSize: "14px", color: colors.steel }}>
                  {line}
                </Text>
              ))}
            </Section>

            <Text style={{ fontSize: "14px", color: colors.steel, margin: "0 0 8px" }}>
              <strong style={{ color: colors.ink }}>Livraison estimée :</strong> {estimatedDelivery}
            </Text>

            <Section style={{ textAlign: "center", marginTop: "28px" }}>
              <Button href={trackOrderUrl} style={ctaButtonStyle}>
                Suivre ma commande
              </Button>
            </Section>

            <Hr style={{ borderColor: colors.boneSoft, margin: "28px 0 20px" }} />
            <Text style={{ fontSize: "13px", lineHeight: "22px", color: colors.steel, margin: 0 }}>
              Besoin d&apos;aide ?{" "}
              <Link href={`${baseUrl}/contact`} style={{ color: colors.ember }}>
                Contactez notre équipe
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
