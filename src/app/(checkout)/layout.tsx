import type { Metadata } from "next";
import { CheckoutShell } from "./CheckoutShell";

export const metadata: Metadata = {
  title: {
    default: "Commande",
    template: "%s — ISHYA",
  },
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutShell>{children}</CheckoutShell>;
}
