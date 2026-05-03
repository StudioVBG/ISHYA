"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type {
  PublicFaqArticle,
  PublicFaqCategory,
} from "@/lib/queries/storefront";

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
        <div className="container max-w-5xl mx-auto">
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
                <div className="space-y-3 max-w-3xl mx-auto">
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
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {categories.map((cat) => (
                <motion.div key={cat.slug} variants={staggerItem}>
                  <Link
                    href={`/aide/${cat.slug}`}
                    className={cn(
                      "group block bg-white border border-border rounded-2xl p-6 transition-all duration-300",
                      "hover:shadow-lg hover:shadow-terracotta/5 hover:border-terracotta/30",
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center mb-4">
                      <HelpCircle className="w-6 h-6 text-terracotta" />
                    </div>
                    <h2 className="font-display text-lg mb-2 group-hover:text-terracotta transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-muted">
                      {cat.count} article{cat.count > 1 ? "s" : ""}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-terracotta font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir les questions
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
