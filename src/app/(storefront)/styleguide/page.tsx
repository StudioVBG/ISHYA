import type { Metadata } from "next";
import { StyleguideContent } from "./StyleguideContent";

export const metadata: Metadata = {
  title: "Styleguide ISHYA — Design system",
  robots: { index: false, follow: false },
};

export default function StyleguidePage() {
  return <StyleguideContent />;
}
