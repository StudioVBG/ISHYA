import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, HelpCircle } from "lucide-react";
import {
  getPublicFaqArticlesByCategorySlug,
  getPublicFaqCategories,
} from "@/lib/queries/storefront";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getPublicFaqCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicFaqArticlesByCategorySlug(slug);
  if (!data) return {};
  return {
    title: `${data.name} — Aide ISHYA`,
    description: `Questions fréquentes sur ${data.name.toLowerCase()}.`,
    alternates: { canonical: `/aide/${slug}` },
  };
}

export default async function AideCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicFaqArticlesByCategorySlug(slug);
  if (!data) notFound();

  return (
    <div className="py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <Link
          href="/aide"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-terracotta transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au centre d&apos;aide
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl">{data.name}</h1>
            <p className="text-sm text-muted">
              {data.articles.length} question
              {data.articles.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-8">
          {data.articles.map((a) => (
            <details
              key={a.id}
              className="bg-white rounded-xl border border-border p-5 group"
            >
              <summary className="flex items-center justify-between cursor-pointer font-medium list-none">
                <span>{a.question}</span>
                <span className="text-muted group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-border/50 text-sm text-muted leading-relaxed whitespace-pre-line">
                {a.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 bg-beige-nude-light rounded-2xl p-6 text-center">
          <h2 className="font-display text-lg mb-2">
            Vous n&apos;avez pas trouvé votre réponse ?
          </h2>
          <p className="text-sm text-muted mb-4">
            Notre équipe est disponible pour répondre à toutes vos questions.
          </p>
          <Link href="/contact" className="btn-primary text-sm inline-flex">
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
