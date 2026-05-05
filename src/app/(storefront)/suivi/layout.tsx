import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suivi de commande",
  description:
    "Suivez l'avancement de votre commande ISHYA en temps réel grâce à votre numéro de commande et votre email.",
  alternates: { canonical: "/suivi" },
  robots: { index: true, follow: false },
};

export default function SuiviLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
