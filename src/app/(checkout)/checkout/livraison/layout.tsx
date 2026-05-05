import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison",
};

export default function LivraisonCheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
