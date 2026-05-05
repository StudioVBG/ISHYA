"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, HelpCircle, ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type {
  PublicFaqArticle,
  PublicFaqCategory,
} from "@/lib/queries/storefront";

// Catégories FAQ qui ont une page dédiée — on lie vers la page rich, pas
// vers une drill-down /aide/<slug> (qui n'existe plus).
const STATIC_PAGE_BY_FAQ_SLUG: Record<string, { href: string; label: string }> =
  {
    livraison: { href: "/livraison", label: "Voir la page Livraison" },
    retours: { href: "/retours", label: "Voir la page Retours" },
    entretien: { href: "/entretien", label: "Voir la page Entretien" },
    materiaux: { href: "/materiaux", label: "Voir la page Matériaux" },
    "programme-fidelite": {
      href: "/programme-fidelite",
      label: "Voir le Programme fidélité",
    },
    tailles: {
      href: "/guide-des-tailles",
      label: "Voir le Guide des tailles",
    },
  };

export function AideList({
  categories,
  articles,
}: {
  categories: PublicFaqCategory[];
  articles: PublicFaqArticle[];
}) {
  const [search, setSearch] = useState("");

  const matched = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return articles.filter(
      (a) =>
        a.question.toLowerCase().includes(q) ||
        a.answer.toLowerCase().includes(q),
    );
  }, [articles, search]);

  const articlesByCategory = useMemo(() => {
    const map = new Map<string, PublicFaqArticle[]>();
    for (const a of articles) {
      const key = a.category ?? "Autres";
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return map;
  }, [articles]);

  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 md:py-24 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Centre d&apos;aide
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Comment pouvons-nous vous aider ?
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted mb-8">
              Trouvez rapidement la réponse à vos questions.
            </motion.p>
            <motion.div variants={fadeInUp} className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une question..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta shadow-sm"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          {search.trim() ? (
            <div>
              <p className="text-sm text-muted mb-6">
                {matched.length} résultat{matched.length > 1 ? "s" : ""} pour
                « {search} »
              </p>
              {matched.length === 0 ? (
                <div className="text-center py-16">
                  <HelpCircle className="w-10 h-10 mx-auto text-muted-light mb-3" />
                  <p className="text-sm text-muted">
                    Aucun résultat. Essayez avec d&apos;autres mots-clés ou
                    contactez-nous.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1 text-sm text-terracotta hover:underline mt-3"
                  >
                    Nous contacter
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {matched.map((a) => (
                    <details
                      key={a.id}
                      className="bg-white rounded-xl border border-border p-5 group"
                    >
                      <summary className="flex items-center justify-between cursor-pointer font-medium">
                        <span>{a.question}</span>
                      </summary>
                      <p className="mt-3 pt-3 border-t border-border/50 text-sm text-muted leading-relaxed whitespace-pre-line">
                        {a.answer}
                      </p>
                    </details>
                  ))}
                </div>
              )}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-10 h-10 mx-auto text-muted-light mb-3" />
              <p className="text-sm text-muted">
                Aucun article d&apos;aide pour le moment. N&apos;hésitez pas à{" "}
                <Link href="/contact" className="text-terracotta hover:underline">
                  nous écrire
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Sommaire — ancres */}
              <nav
                aria-label="Sommaire de l'aide"
                className="flex flex-wrap gap-2 justify-center"
              >
                {categories.map((cat) => (
                  <a
                    key={cat.slug}
                    href={`#${cat.slug}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-beige-nude-light hover:bg-terracotta/10 hover:text-terracotta transition-colors"
                  >
                    {cat.name}
                  </a>
                ))}
              </nav>

              {/* Articles groupés par catégorie */}
              {categories.map((cat) => {
                const items = articlesByCategory.get(cat.name) ?? [];
                if (items.length === 0) return null;
                const linked = STATIC_PAGE_BY_FAQ_SLUG[cat.slug];
                return (
                  <motion.section
                    key={cat.slug}
                    id={cat.slug}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={staggerContainer}
                    className="scroll-mt-24"
                  >
                    <motion.div
                      variants={staggerItem}
                      className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0">
                          <HelpCircle className="w-5 h-5 text-terracotta" />
                        </div>
                        <h2 className="font-display text-2xl">{cat.name}</h2>
                      </div>
                      {linked && (
                        <Link
                          href={linked.href}
                          className="hidden sm:inline-flex items-center gap-1 text-sm text-terracotta hover:underline whitespace-nowrap"
                        >
                          {linked.label}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </motion.div>
                    <div className="space-y-3">
                      {items.map((a) => (
                        <motion.details
                          key={a.id}
                          variants={staggerItem}
                          className="bg-white rounded-xl border border-border p-5 group"
                        >
                          <summary className="flex items-center justify-between cursor-pointer font-medium list-none">
                            <span>{a.question}</span>
                            <span className="text-muted group-open:rotate-180 transition-transform">
                              ▾
                            </span>
                          </summary>
                          <p className="mt-3 pt-3 border-t border-border/50 text-sm text-muted leading-relaxed whitespace-pre-line">
                            {a.answer}
                          </p>
                        </motion.details>
                      ))}
                    </div>
                    {linked && (
                      <Link
                        href={linked.href}
                        className="sm:hidden inline-flex items-center gap-1 text-sm text-terracotta hover:underline mt-4"
                      >
                        {linked.label}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </motion.section>
                );
              })}

              {/* Bloc contact */}
              <div className="bg-beige-nude-light rounded-2xl p-8 text-center">
                <h2 className="font-display text-xl mb-2">
                  Vous n&apos;avez pas trouvé votre réponse ?
                </h2>
                <p className="text-sm text-muted mb-4">
                  Notre équipe répond à toutes vos questions sous 24 h ouvrées.
                </p>
                <Link href="/contact" className="btn-primary text-sm inline-flex">
                  Nous contacter
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
