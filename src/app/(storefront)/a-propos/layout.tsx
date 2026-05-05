import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — L'histoire d'ISHYA",
  description:
    "Découvrez l'histoire d'ISHYA, maison française de bijoux floraux artisanaux. Depuis 2022, nous capturons la poésie des fleurs séchées dans des créations uniques.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: "À propos d'ISHYA",
    description:
      "L'histoire d'une maison française dédiée aux bijoux floraux artisanaux.",
    url: "/a-propos",
    type: "article",
  },
};

export default function AProposLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
