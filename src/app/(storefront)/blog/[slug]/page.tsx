import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Calendar, ArrowLeft, BookOpen } from "lucide-react";
import {
  getAllBlogSlugs,
  getBlogPostBySlug,
  getPublishedBlogPosts,
} from "@/lib/queries/storefront";
import { JsonLd, siteUrl } from "@/components/seo/JsonLd";
import { renderCmsBody } from "@/lib/cms/render-body";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  // Articles suggérés (3 plus récents, sauf l'actuel)
  const allPosts = await getPublishedBlogPosts(6);
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const articleJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.publishedAt ?? undefined,
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : { "@type": "Organization", name: "ISHYA" },
    publisher: {
      "@type": "Organization",
      name: "ISHYA",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl()}/images/hero-ishya.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl()}/blog/${slug}`,
    },
  };

  return (
    <article className="py-12 px-4">
      <JsonLd data={articleJsonLd} />
      <div className="container max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-terracotta transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au journal
        </Link>

        {post.tags[0] && (
          <span className="inline-block bg-terracotta/10 text-terracotta-dark text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            {post.tags[0]}
          </span>
        )}

        <h1 className="font-display text-3xl md:text-5xl mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted mb-8">
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt)}
            </span>
          )}
          {post.authorName && (
            <>
              <span>·</span>
              <span>Par {post.authorName}</span>
            </>
          )}
        </div>

        {post.coverImageUrl && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-beige-nude-light">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {post.excerpt && (
          <p className="text-lg text-muted leading-relaxed mb-8 italic">
            {post.excerpt}
          </p>
        )}

        <div className="text-foreground/85 text-base">
          {renderCmsBody(post.body)}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-beige-nude-light text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="container max-w-5xl mx-auto mt-20 pt-12 border-t border-border">
          <h2 className="font-display text-2xl mb-8 text-center">
            Continuez la lecture
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group block bg-white border border-border rounded-2xl overflow-hidden hover:border-terracotta/30 transition-colors"
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-beige-nude-light">
                  {p.coverImageUrl ? (
                    <Image
                      src={p.coverImageUrl}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-light" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base group-hover:text-terracotta transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  {p.publishedAt && (
                    <p className="text-xs text-muted mt-2">
                      {formatDate(p.publishedAt)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
