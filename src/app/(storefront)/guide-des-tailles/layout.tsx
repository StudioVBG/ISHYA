import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide des tailles — Bagues, bracelets, colliers",
  description:
    "Mesurez votre tour de doigt, de poignet ou la longueur de collier qui vous convient grâce à nos guides de tailles ISHYA.",
  alternates: { canonical: "/guide-des-tailles" },
};

export default function GuideTaillesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
