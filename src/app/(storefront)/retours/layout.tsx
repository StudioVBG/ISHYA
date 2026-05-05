import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retours et échanges — Politique 14 jours",
  description:
    "Comment retourner ou échanger un bijou ISHYA dans les 14 jours : conditions, procédure, frais et remboursement.",
  alternates: { canonical: "/retours" },
};

export default function RetoursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
