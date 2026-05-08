import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
  Link,
} from "@react-email/components";
import { colors, fontBody, fontDisplay, EmailHeadFonts } from "./shared";

export interface ContactNotificationEmailProps {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  receivedAt: string;
}

export const contactNotificationSubject = (subject?: string | null) =>
  subject ? `[Contact] ${subject}` : "[Contact] Nouveau message";

export function ContactNotificationEmail({
  name,
  email,
  subject,
  message,
  receivedAt,
}: ContactNotificationEmailProps) {
  return (
    <Html lang="fr">
      <Head>
        <EmailHeadFonts />
      </Head>
      <Preview>Nouveau message de {name} via le formulaire de contact ISHYA</Preview>
      <Body style={{ margin: 0, backgroundColor: colors.bone, fontFamily: fontBody }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
          <Heading
            as="h1"
            style={{
              fontFamily: fontDisplay,
              fontSize: "22px",
              lineHeight: "30px",
              fontWeight: 600,
              color: colors.ink,
              margin: "0 0 8px",
            }}
          >
            Nouveau message de contact
          </Heading>
          <Text style={{ margin: "0 0 24px", fontSize: "12px", color: colors.steel }}>
            Reçu le {receivedAt}
          </Text>

          <Section
            style={{
              backgroundColor: colors.boneSoft,
              borderRadius: "8px",
              padding: "20px 24px",
              border: `1px solid ${colors.boneSoft}`,
            }}
          >
            <Row label="De" value={name} />
            <Row
              label="Email"
              value={
                <Link href={`mailto:${email}`} style={{ color: colors.ember }}>
                  {email}
                </Link>
              }
            />
            {subject ? <Row label="Sujet" value={subject} /> : null}
          </Section>

          <Hr style={{ borderColor: colors.boneSoft, margin: "24px 0" }} />

          <Text
            style={{
              margin: "0 0 8px",
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: colors.steel,
            }}
          >
            Message
          </Text>
          <Text
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: "24px",
              color: colors.ink,
              whiteSpace: "pre-wrap",
            }}
          >
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Text style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: "20px", color: colors.steel }}>
      <strong style={{ color: colors.ink, marginRight: "8px" }}>{label} :</strong>
      {value}
    </Text>
  );
}
