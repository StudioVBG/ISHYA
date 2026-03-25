"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  Shield,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  scaleIn,
} from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import {
  demoCategories,
  demoCollections,
  getBestSellers,
  demoReviews,
  reviewAuthors,
} from "@/lib/demo-data";

const trustItems = [
  { icon: Truck, title: "Livraison offerte", desc: "Dès 60€ d'achat" },
  { icon: RotateCcw, title: "Retours 14 jours", desc: "Satisfait ou remboursé" },
  { icon: Shield, title: "Paiement sécurisé", desc: "CB, PayPal, Apple Pay" },
  { icon: Heart, title: "Fait main avec amour", desc: "Artisanat français" },
];

const giftBudgets = [
  { label: "Moins de 30€", min: 0, max: 30, color: "from-terracotta/80 to-terracotta" },
  { label: "30€ – 60€", min: 30, max: 60, color: "from-gold/80 to-gold" },
  { label: "Plus de 60€", min: 60, max: 999, color: "from-foreground/80 to-foreground" },
];

const homeReviews = demoReviews.slice(0, 3);

export default function HomePage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const bestSellers = getBestSellers();
  const [email, setEmail] = useState("");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-ishya.png"
          alt="Collection de boucles d'oreilles florales ISHYA"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 text-center text-white px-4 max-w-3xl"
        >
          <motion.p
            variants={fadeInUp}
            className="uppercase tracking-[0.3em] text-sm mb-4 text-white/80"
          >
            Bijoux floraux artisanaux
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wider mb-6"
          >
            ISHYA
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl font-light mb-10 text-white/90 max-w-xl mx-auto"
          >
            Bijoux floraux artisanaux en fleurs séchées et résine
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/boutique" className="btn-primary text-base px-10 py-4">
              Découvrir la collection
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Catégories ───────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="font-display text-3xl md:text-4xl text-center mb-14"
          >
            Nos Catégories
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8"
          >
            {demoCategories.map((category) => (
              <motion.div key={category.id} variants={staggerItem}>
                <Link
                  href={`/boutique/${category.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-terracotta transition-all duration-300">
                    <Image
                      src={category.image_url!}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-medium group-hover:text-terracotta transition-colors">
                    {category.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Best-sellers Carousel ─────────────────────────────── */}
      <section className="py-20 bg-beige-nude-light/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-terracotta uppercase tracking-widest text-xs mb-2">
                Les favoris
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                Nos Best-sellers
              </h2>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={scrollPrev}
                className="p-2.5 rounded-full border border-border hover:border-terracotta hover:text-terracotta transition-colors"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                className="p-2.5 rounded-full border border-border hover:border-terracotta hover:text-terracotta transition-colors"
                aria-label="Suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {bestSellers.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-[0_0_50%] md:flex-[0_0_25%] pl-4 min-w-0"
                >
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex sm:hidden justify-center gap-2 mt-6">
            <button
              onClick={scrollPrev}
              className="p-2.5 rounded-full border border-border"
              aria-label="Précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="p-2.5 rounded-full border border-border"
              aria-label="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Nouvelle Collection ───────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              variants={scaleIn}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden"
            >
              <Image
                src={demoCollections[0].image_url!}
                alt="Collection Printemps Éternel"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <span className="text-terracotta uppercase tracking-[0.2em] text-xs font-medium">
                Nouvelle Collection
              </span>
              <h2 className="font-display text-4xl md:text-5xl mt-4 mb-6">
                Printemps Éternel
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                Une collection qui capture l&apos;essence du renouveau
                printanier. Fleurs immortalisées dans la résine, couleurs
                pastel et éclats dorés pour une élégance intemporelle.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Chaque pièce est unique, fabriquée à la main dans notre
                atelier avec des fleurs soigneusement sélectionnées et
                séchées.
              </p>
              <Link
                href="/collections/printemps-eternel"
                className="btn-primary inline-flex items-center gap-2"
              >
                Découvrir la collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Idées Cadeaux ────────────────────────────────────── */}
      <section className="py-20 bg-beige-nude-light/30 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <p className="text-terracotta uppercase tracking-widest text-xs mb-2">
              Trouvez le bijou parfait
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              Idées Cadeaux
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {giftBudgets.map((budget) => (
              <motion.div key={budget.label} variants={staggerItem}>
                <Link
                  href={`/idees-cadeaux?min=${budget.min}&max=${budget.max}`}
                  className={cn(
                    "block relative rounded-2xl overflow-hidden p-8 md:p-10 text-white aspect-[4/3] flex flex-col justify-end bg-gradient-to-br",
                    budget.color
                  )}
                >
                  <h3 className="font-display text-2xl md:text-3xl mb-2">
                    {budget.label}
                  </h3>
                  <p className="text-white/80 text-sm">
                    Découvrir les bijoux →
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trust Banner ──────────────────────────────────────── */}
      <section className="py-16 border-y border-border">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {trustItems.map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-beige-nude-light flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-terracotta" />
                </div>
                <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Avis Clients ──────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <p className="text-terracotta uppercase tracking-widest text-xs mb-2">
              Témoignages
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              Ce que nos clientes disent
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {homeReviews.map((review) => (
              <motion.div
                key={review.id}
                variants={staggerItem}
                className="bg-white rounded-2xl p-8 shadow-sm border border-border/50"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < review.rating
                          ? "fill-gold text-gold"
                          : "fill-border text-border"
                      )}
                    />
                  ))}
                </div>
                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}
                <p className="text-muted text-sm leading-relaxed mb-4">
                  &ldquo;{review.content}&rdquo;
                </p>
                <p className="text-xs font-medium text-terracotta">
                  {reviewAuthors[review.user_id] ?? "Cliente ISHYA"}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────── */}
      <section className="py-20 bg-foreground text-white px-4">
        <div className="container max-w-xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl md:text-4xl mb-4"
            >
              Rejoignez la famille ISHYA
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-white/70 mb-8"
            >
              Inscrivez-vous à notre newsletter et recevez{" "}
              <span className="text-terracotta font-medium">-10%</span> sur
              votre première commande.
            </motion.p>
            <motion.form
              variants={fadeInUp}
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="flex-1 px-5 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-terracotta transition-colors"
              />
              <button
                type="submit"
                className="btn-primary px-8 py-3.5 whitespace-nowrap"
              >
                S&apos;inscrire
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </>
  );
}
