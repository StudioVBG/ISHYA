import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PreviewView } from "./PreviewView";

export const metadata: Metadata = {
  title: "Aperçu admin · ISHYA",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (kind !== "blog" && kind !== "page") notFound();
  return <PreviewView kind={kind} />;
}
