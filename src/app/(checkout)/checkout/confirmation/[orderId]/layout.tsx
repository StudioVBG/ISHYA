import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commande confirmée",
};

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
