import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAllPackSlugs, getPackBySlug } from "@/lib/queries/storefront";
import { PackPageClient } from "./PackPageClient";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPackSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) return { title: "Pack introuvable — ISHYA" };
  return {
    title: `${pack.name} — Pack ISHYA`,
    description:
      pack.description ?? `Le pack ${pack.name} composé de plusieurs pièces.`,
    openGraph: {
      title: `${pack.name} — Pack ISHYA`,
      description: pack.description ?? undefined,
      images: pack.image_url ? [{ url: pack.image_url }] : undefined,
    },
  };
}

export default async function PackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) notFound();
  return <PackPageClient pack={pack} />;
}
