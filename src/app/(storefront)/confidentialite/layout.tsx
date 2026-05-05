import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment ISHYA collecte, utilise et protège vos données personnelles, conformément au RGPD et à la loi Informatique et Libertés.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: true, follow: true },
};

export default function ConfidentialiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
