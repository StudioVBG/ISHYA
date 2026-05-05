import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement sécurisé",
};

export default function PaiementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
