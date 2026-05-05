import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérification de votre email",
};

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
