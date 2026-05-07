import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllPublishedCmsSlugs,
  getPublicCmsPageBySlug,
} from "@/lib/queries/storefront";
import { renderCmsBody } from "@/lib/cms/render-body";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPublishedCmsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicCmsPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
    alternates: { canonical: `/p/${slug}` },
    openGraph: {
      title: page.metaTitle ?? page.title,
      description: page.metaDescription ?? undefined,
      type: "article",
      url: `/p/${slug}`,
    },
  };
}

export default async function PublicCmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPublicCmsPageBySlug(slug);
  if (!page) notFound();

  return (
    <article className="py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-5xl mb-4 leading-tight">
          {page.title}
        </h1>
        {page.publishedAt && (
          <p className="text-sm text-muted mb-8">
            Mise à jour le {formatDate(page.publishedAt)}
          </p>
        )}
        <div className="text-foreground/85 text-base">
          {renderCmsBody(page.body)}
        </div>
      </div>
    </article>
  );
}
