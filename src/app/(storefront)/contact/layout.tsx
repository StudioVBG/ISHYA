import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Une question, une suggestion ?",
  description:
    "Contactez l'équipe ISHYA : conseils, suivi de commande, retours, presse ou partenariats. Réponse sous 48h ouvrées.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Nous contacter — ISHYA",
    description: "L'équipe ISHYA est là pour vous répondre.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
