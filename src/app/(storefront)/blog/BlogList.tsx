"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { BlogPostSummary } from "@/lib/queries/storefront";

export function BlogList({ posts }: { posts: BlogPostSummary[] }) {
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) for (const t of p.tags) set.add(t);
    return ["Tous", ...Array.from(set).sort()];
  }, [posts]);

  const [activeTag, setActiveTag] = useState("Tous");

  const filtered = useMemo(() => {
    if (activeTag === "Tous") return posts;
    return posts.filter((p) => p.tags.includes(activeTag));
  }, [posts, activeTag]);

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
              <BookOpen className="w-3.5 h-3.5" />
              Journal
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Le Journal ISHYA
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted">
              Conseils d&apos;entretien, guides d&apos;achat, tendances et
              coulisses de notre atelier. Tout l&apos;univers ISHYA en articles.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 mx-auto text-muted-light mb-3" />
              <p className="text-sm text-muted">
                Aucun article publié pour le moment. Revenez bientôt !
              </p>
            </div>
          ) : (
            <>
              {allTags.length > 1 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="flex flex-wrap gap-2 justify-center mb-12"
                >
                  {allTags.map((tag) => (
                    <motion.button
                      key={tag}
                      variants={staggerItem}
                      onClick={() => setActiveTag(tag)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm transition-all",
                        activeTag === tag
                          ? "bg-terracotta text-white"
                          : "bg-white border border-border text-muted hover:border-terracotta hover:text-terracotta",
                      )}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid md:grid-cols-3 gap-8"
              >
                {filtered.map((article) => (
                  <motion.article key={article.slug} variants={staggerItem}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="group block bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-terracotta/5 hover:border-terracotta/30 transition-all duration-300"
                    >
                      <div className="aspect-[16/10] relative overflow-hidden bg-beige-nude-light">
                        {article.coverImageUrl ? (
                          <Image
                            src={article.coverImageUrl}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-muted-light" />
                          </div>
                        )}
                        {article.tags[0] && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full">
                              {article.tags[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 text-xs text-muted mb-3">
                          {article.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(article.publishedAt)}
                            </span>
                          )}
                          {article.authorName && (
                            <>
                              <span>·</span>
                              <span>{article.authorName}</span>
                            </>
                          )}
                        </div>
                        <h2 className="font-display text-lg mb-2 group-hover:text-terracotta transition-colors line-clamp-2">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm text-terracotta font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Lire la suite
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </motion.div>

              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted py-12">
                  Aucun article pour ce tag.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
