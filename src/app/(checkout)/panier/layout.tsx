import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon panier",
};

export default function PanierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
