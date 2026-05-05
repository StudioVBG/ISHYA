import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identification",
};

export default function IdentificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
