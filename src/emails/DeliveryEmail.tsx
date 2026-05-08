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
  EmailHeadFonts,
  EmailHeader,
  EmailFooter,
  ctaButtonStyle,
} from "./shared";

export interface DeliveryEmailProps {
  firstName: string;
  reviewUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const deliveryEmailSubject = "Votre commande est arrivée !";

export function DeliveryEmail({
  firstName,
  reviewUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: DeliveryEmailProps) {
  const previewText = `${firstName}, nous espérons que vos bijoux ISHYA vous enchantent. +50 points fidélité pour vous.`;

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
              Votre commande est arrivée !
            </Heading>
            <Text style={{ fontSize: "16px", lineHeight: "26px", color: colors.steel, margin: "0 0 20px" }}>
              Bonjour {firstName},
            </Text>
            <Text style={{ fontSize: "15px", lineHeight: "24px", color: colors.steel, margin: "0 0 20px" }}>
              Nous espérons que vos bijoux ISHYA vous plaisent autant qu&apos;à nous de les avoir préparés pour vous.
              Chaque pièce raconte une histoire de fleurs préservées et de savoir-faire artisanal.
            </Text>

            <Section
              style={{
                backgroundColor: colors.boneSoft,
                borderLeft: `4px solid ${colors.ember}`,
                padding: "16px 20px",
                marginBottom: "24px",
                borderRadius: "4px",
              }}
            >
              <Text style={{ margin: 0, fontSize: "14px", lineHeight: "22px", color: colors.ink }}>
                <strong>+50 points fidélité</strong> viennent d&apos;être ajoutés à votre compte pour célébrer la
                réception de votre commande. Consultez votre espace fidélité pour en profiter.
              </Text>
            </Section>

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
              Un petit rappel pour les chérir longtemps
            </Heading>
            <Text style={{ fontSize: "14px", lineHeight: "22px", color: colors.steel, margin: "0 0 24px" }}>
              Évitez l&apos;eau, les parfums et les chocs. Rangez vos bijoux à l&apos;abri du soleil direct. Un chiffon
              doux suffit pour leur redonner leur éclat.
            </Text>

            <Section style={{ textAlign: "center" }}>
              <Button href={reviewUrl} style={ctaButtonStyle}>
                Laisser un avis
              </Button>
            </Section>

            <Hr style={{ borderColor: colors.boneSoft, margin: "32px 0 20px" }} />
            <Text style={{ fontSize: "13px", lineHeight: "22px", color: colors.steel, margin: 0 }}>
              Besoin d&apos;un conseil taille ou d&apos;un échange ?{" "}
              <Link href={`${baseUrl}/aide`} style={{ color: colors.ember }}>
                Centre d&apos;aide
              </Link>
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
