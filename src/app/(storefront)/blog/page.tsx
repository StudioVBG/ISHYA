"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const categories = [
  { label: "Tous", slug: "tous" },
  { label: "Entretien", slug: "entretien" },
  { label: "Guides", slug: "guides" },
  { label: "Tendances", slug: "tendances" },
  { label: "Coulisses", slug: "coulisses" },
];

const articles = [
  {
    slug: "comment-entretenir-vos-bijoux-en-fleurs-sechees",
    title: "Comment entretenir vos bijoux en fleurs séchées",
    excerpt:
      "Découvrez nos conseils d'experte pour préserver la beauté de vos bijoux ISHYA au fil du temps. De simples gestes au quotidien qui font toute la différence.",
    category: "Entretien",
    date: "12 mars 2026",
    readTime: "5 min",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=500&fit=crop",
  },
  {
    slug: "guide-choisir-la-bague-parfaite",
    title: "Guide : Choisir la bague parfaite",
    excerpt:
      "Comment trouver la bague qui vous correspond ? Taille, style, occasion… Notre guide complet pour un choix éclairé et une pièce que vous chérirez longtemps.",
    category: "Guides",
    date: "5 mars 2026",
    readTime: "7 min",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=500&fit=crop",
  },
  {
    slug: "tendances-bijoux-floraux-2026",
    title: "Tendances bijoux floraux 2026",
    excerpt:
      "Les bijoux botaniques sont plus que jamais au cœur des tendances. Découvrez les styles, couleurs et matières qui marqueront cette année en bijouterie florale.",
    category: "Tendances",
    date: "28 février 2026",
    readTime: "6 min",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=500&fit=crop",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
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
          {/* Category tags */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-wrap gap-2 justify-center mb-12"
          >
            {categories.map((cat, i) => (
              <motion.button
                key={cat.slug}
                variants={staggerItem}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all",
                  i === 0
                    ? "bg-terracotta text-white"
                    : "bg-white border border-border text-muted hover:border-terracotta hover:text-terracotta"
                )}
              >
                {cat.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Articles grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {articles.map((article) => (
              <motion.article key={article.slug} variants={staggerItem}>
                <Link
                  href={`/blog/${article.slug}`}
                  className="group block bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-terracotta/5 hover:border-terracotta/30 transition-all duration-300"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-muted mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.date}
                      </span>
                      <span>·</span>
                      <span>{article.readTime} de lecture</span>
                    </div>
                    <h2 className="font-display text-lg mb-2 group-hover:text-terracotta transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-terracotta font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Lire la suite
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
