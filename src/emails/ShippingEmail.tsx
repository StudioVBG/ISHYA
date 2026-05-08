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

export interface ShippingItemSummary {
  name: string;
  imageUrl: string;
  quantity: number;
}

export interface ShippingEmailProps {
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  trackParcelUrl: string;
  estimatedDeliveryDate: string;
  items: ShippingItemSummary[];
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const shippingEmailSubject = "Votre commande a été expédiée !";

export function ShippingEmail({
  orderNumber,
  trackingNumber,
  carrier,
  trackParcelUrl,
  estimatedDeliveryDate,
  items,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: ShippingEmailProps) {
  const previewText = `Bonne nouvelle : votre commande #${orderNumber} est en route. Suivi ${carrier}.`;

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
                margin: "0 0 16px",
              }}
            >
              Votre commande a été expédiée !
            </Heading>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.steel, margin: "0 0 20px" }}>
              Votre colis ISHYA a quitté notre atelier. Vous pouvez suivre son trajet jusqu&apos;à votre boîte aux
              lettres.
            </Text>

            <Section
              style={{
                backgroundColor: colors.boneSoft,
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <Text style={{ margin: "0 0 6px", fontSize: "13px", color: colors.steel }}>Commande</Text>
              <Text style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 600, color: colors.ink }}>
                #{orderNumber}
              </Text>
              <Text style={{ margin: "0 0 6px", fontSize: "13px", color: colors.steel }}>Transporteur</Text>
              <Text style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 600, color: colors.ink }}>
                {carrier}
              </Text>
              <Text style={{ margin: "0 0 6px", fontSize: "13px", color: colors.steel }}>Numéro de suivi</Text>
              <Text
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: colors.ink,
                  fontFamily: fontBody,
                }}
              >
                {trackingNumber}
              </Text>
            </Section>

            <Text style={{ fontSize: "14px", color: colors.steel, margin: "0 0 24px" }}>
              <strong style={{ color: colors.ink }}>Livraison estimée :</strong> {estimatedDeliveryDate}
            </Text>

            <Section style={{ textAlign: "center", marginBottom: "32px" }}>
              <Button href={trackParcelUrl} style={ctaButtonStyle}>
                Suivre mon colis
              </Button>
            </Section>

            <Heading
              as="h2"
              style={{
                fontFamily: fontDisplay,
                fontSize: "18px",
                fontWeight: 600,
                color: colors.ink,
                margin: "0 0 16px",
              }}
            >
              Dans votre colis
            </Heading>
            <Row>
              {items.slice(0, 3).map((item, i) => (
                <Column key={i} style={{ width: `${100 / Math.min(items.length, 3)}%`, padding: "0 6px", verticalAlign: "top" }}>
                  <Img
                    src={item.imageUrl}
                    alt={item.name}
                    width={160}
                    height={160}
                    style={{ borderRadius: "6px", display: "block", marginBottom: "8px", width: "160px", height: "auto", objectFit: "cover" }}
                  />
                  <Text style={{ margin: 0, fontSize: "12px", color: colors.ink, fontWeight: 600 }}>{item.name}</Text>
                  <Text style={{ margin: "4px 0 0", fontSize: "11px", color: colors.steel }}>× {item.quantity}</Text>
                </Column>
              ))}
            </Row>

            <Hr style={{ borderColor: colors.boneSoft, margin: "28px 0 20px" }} />
            <Text style={{ fontSize: "13px", lineHeight: "22px", color: colors.steel, margin: 0 }}>
              Question sur la livraison ?{" "}
              <Link href={`${baseUrl}/contact`} style={{ color: colors.ember }}>
                Écrivez-nous
              </Link>
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
