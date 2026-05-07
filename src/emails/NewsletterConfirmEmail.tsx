import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
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

export interface NewsletterConfirmEmailProps {
  confirmUrl: string;
  baseUrl: string;
  unsubscribeUrl: string;
  logoSrc?: string;
}

export const newsletterConfirmEmailSubject =
  "Confirmez votre inscription à la newsletter ISHYA";

export function NewsletterConfirmEmail({
  confirmUrl,
  baseUrl,
  unsubscribeUrl,
  logoSrc,
}: NewsletterConfirmEmailProps) {
  return (
    <Html lang="fr">
      <Head>
        <EmailHeadFonts />
      </Head>
      <Preview>
        Confirmez votre inscription pour recevoir votre code -10 % et nos
        nouveautés.
      </Preview>
      <Body
        style={{
          margin: 0,
          backgroundColor: colors.ivory,
          fontFamily: fontBody,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: colors.ivory,
          }}
        >
          <EmailHeader baseUrl={baseUrl} logoSrc={logoSrc} />
          <Section style={{ padding: "8px 32px 32px" }}>
            <Heading
              as="h1"
              style={{
                fontFamily: fontDisplay,
                fontSize: "26px",
                lineHeight: "34px",
                fontWeight: 600,
                color: colors.black,
                margin: "0 0 20px",
              }}
            >
              Confirmez votre inscription
            </Heading>
            <Text
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: colors.textMuted,
                margin: "0 0 16px",
              }}
            >
              Quelqu&apos;un (probablement vous !) a inscrit cette adresse à la
              newsletter ISHYA. Pour finaliser votre inscription et recevoir
              votre code <strong style={{ color: colors.black }}>-10 %</strong>{" "}
              de bienvenue, cliquez sur le bouton ci-dessous.
            </Text>

            <Section style={{ textAlign: "center", marginTop: "28px" }}>
              <Button href={confirmUrl} style={ctaButtonStyle}>
                Confirmer mon inscription
              </Button>
            </Section>

            <Text
              style={{
                fontSize: "13px",
                lineHeight: "20px",
                color: colors.textMuted,
                margin: "28px 0 0",
              }}
            >
              Si vous n&apos;êtes pas à l&apos;origine de cette inscription,
              ignorez simplement ce message — votre adresse ne sera pas ajoutée
              à notre liste.
            </Text>
            <Text
              style={{
                fontSize: "12px",
                lineHeight: "18px",
                color: colors.textMuted,
                margin: "16px 0 0",
              }}
            >
              Le lien expire dans 30 jours. Si le bouton ne fonctionne pas,
              copiez-collez l&apos;URL :{" "}
              <Link
                href={confirmUrl}
                style={{ color: colors.terracotta, wordBreak: "break-all" }}
              >
                {confirmUrl}
              </Link>
            </Text>
          </Section>
          <EmailFooter baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}
