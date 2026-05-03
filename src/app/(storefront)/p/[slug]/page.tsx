import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllPublishedCmsSlugs,
  getPublicCmsPageBySlug,
} from "@/lib/queries/storefront";
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

function renderBody(body: string | null): React.ReactNode {
  if (!body) return null;
  const trimmed = body.trim();
  if (trimmed.startsWith("<")) {
    return <div dangerouslySetInnerHTML={{ __html: trimmed }} />;
  }
  const blocks = trimmed.split(/\n{2,}/);
  return blocks.map((block, i) => {
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="font-display text-xl mt-8 mb-3">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="font-display text-2xl mt-10 mb-4">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("- ") || block.startsWith("* ")) {
      const items = block.split(/\n/).map((l) => l.replace(/^[-*]\s*/, ""));
      return (
        <ul key={i} className="list-disc pl-6 space-y-1 my-4">
          {items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="leading-relaxed mb-4">
        {block.split(/\n/).map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
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
          {renderBody(page.body)}
        </div>
      </div>
    </article>
  );
}
