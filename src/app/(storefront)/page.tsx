import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  RotateCcw,
  Shield,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BestSellersCarousel } from "@/components/home/BestSellersCarousel";
import { HeroReveal } from "@/components/home/HeroReveal";
import {
  getTopCategories,
  getBestSellers,
  getFeaturedCollection,
  getHomepageReviews,
  getHeroBanner,
  getHomeDesign,
} from "@/lib/queries/storefront";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "ISHYA — Bijoux floraux artisanaux en fleurs séchées et résine",
  description:
    "Découvrez les créations ISHYA : colliers, bagues, bracelets et boucles d'oreilles uniques en fleurs séchées et résine, façonnés à la main dans notre atelier parisien.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ISHYA — Bijoux floraux artisanaux",
    description:
      "Bijoux uniques en fleurs séchées et résine, façonnés à la main à Paris.",
    type: "website",
    url: "/",
  },
};

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

export default async function HomePage() {
  const [
    categories,
    bestSellers,
    featuredCollection,
    homeReviews,
    heroBanner,
    homeDesign,
  ] = await Promise.all([
    getTopCategories(6),
    getBestSellers(8),
    getFeaturedCollection(),
    getHomepageReviews(3),
    getHeroBanner(),
    getHomeDesign(),
  ]);

  const heroImage =
    homeDesign.heroBackgroundUrl ??
    heroBanner?.imageUrl ??
    "/images/hero-ishya.png";
  const heroEyebrow = heroBanner?.subtitle ?? "Bijoux floraux artisanaux";
  const heroTitle = heroBanner?.title ?? "ISHYA";
  const heroSubtitle = heroBanner
    ? null
    : "Bijoux floraux artisanaux en fleurs séchées et résine";
  const heroCtaHref = heroBanner?.linkUrl ?? "/boutique";
  const overlayAlpha = Math.max(0, Math.min(100, homeDesign.heroOverlayOpacity)) / 100;

  return (
    <>
      {/* ── Hero — Plein écran, image en fond ──────────────────── */}
      <section className="relative bg-ink text-bone overflow-hidden min-h-[100svh] flex">
        <Image
          src={heroImage}
          alt={heroBanner?.title ?? "Collection ISHYA"}
          fill
          className="object-cover object-center -z-10"
          priority
          sizes="100vw"
        />
        {/* Voile sombre paramétrable pour garantir la lisibilité */}
        <div
          className="absolute inset-0 -z-10 bg-ink"
          style={{ opacity: overlayAlpha }}
          aria-hidden
        />
        {/* Dégradé subtil bas → haut pour lester le texte */}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent"
          aria-hidden
        />

        <div className="relative grid grid-cols-12 w-full gap-y-12 md:gap-y-0">
          <div className="col-span-12 md:col-span-7 lg:col-span-6 lg:col-start-2 flex flex-col justify-end pt-32 md:pt-24 pb-16 md:pb-24 px-(--gutter)">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-10 bg-ember" aria-hidden />
              <span className="eyebrow text-bone/80">
                {heroEyebrow} · Édition 2026
              </span>
            </div>

            <HeroReveal>
              <h1
                className="font-display text-bone leading-[1.02] tracking-[-0.04em] mb-8 [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
                style={{
                  fontSize: "var(--text-display)",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
                  fontWeight: 380,
                }}
              >
                {heroTitle}
              </h1>
            </HeroReveal>

            {heroSubtitle && (
              <p className="text-lg md:text-xl text-bone/85 max-w-md leading-snug mb-10 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
                {heroSubtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={heroCtaHref}
                className="btn-ember inline-flex items-center gap-2 text-base px-7"
              >
                Découvrir la collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/atelier"
                className="text-sm text-bone/80 hover:text-bone transition-colors underline-offset-4 hover:underline"
              >
                L&apos;atelier
              </Link>
            </div>
          </div>

          {/* Numérotation édition mono, coin bas droit */}
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-3 text-bone/80">
            <span className="font-mono text-xs tracking-widest">N° 01 / 26</span>
            <span className="h-px w-8 bg-bone/40" aria-hidden />
          </div>
        </div>
      </section>

      {/* ── Catégories ───────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center mb-8 sm:mb-12 md:mb-14">
            Nos Catégories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/boutique?categorie=${category.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-terracotta transition-all duration-300 bg-beige-nude-light">
                  {category.image_url && (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                    />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium group-hover:text-terracotta transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best-sellers Carousel ─────────────────────────────── */}
      <section className="py-20 bg-beige-nude-light/30">
        <div className="container">
          <BestSellersCarousel products={bestSellers} />
          <div className="text-center mt-10">
            <Link
              href="/boutique?badge=best-seller"
              className="inline-flex items-center gap-2 text-sm font-medium text-terracotta hover:underline"
            >
              Voir tous les best-sellers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Nouvelle Collection ───────────────────────────────── */}
      {featuredCollection && (
        <section className="py-20 px-4">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-beige-nude-light">
                {featuredCollection.image_url && (
                  <Image
                    src={featuredCollection.image_url}
                    alt={featuredCollection.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
              <div>
                <span className="text-terracotta uppercase tracking-[0.2em] text-xs font-medium">
                  Nouvelle Collection
                </span>
                <h2 className="font-display text-4xl md:text-5xl mt-4 mb-6">
                  {featuredCollection.name}
                </h2>
                {featuredCollection.description && (
                  <p className="text-muted leading-relaxed mb-8">
                    {featuredCollection.description}
                  </p>
                )}
                <Link
                  href={`/boutique?collection=${featuredCollection.slug}`}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Découvrir la collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Idées Cadeaux ────────────────────────────────────── */}
      <section className="py-20 bg-beige-nude-light/30 px-4">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-terracotta uppercase tracking-widest text-xs mb-2">
              Trouvez le bijou parfait
            </p>
            <h2 className="font-display text-3xl md:text-4xl">Idées Cadeaux</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {giftBudgets.map((budget) => (
              <Link
                key={budget.label}
                href={`/boutique?min=${budget.min}&max=${budget.max}&tri=popularite`}
                className={cn(
                  "block relative rounded-2xl overflow-hidden p-8 md:p-10 text-white aspect-[4/3] flex flex-col justify-end bg-gradient-to-br",
                  budget.color
                )}
              >
                <h3 className="font-display text-2xl md:text-3xl mb-2">
                  {budget.label}
                </h3>
                <p className="text-white/80 text-sm">Découvrir les bijoux →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Banner ──────────────────────────────────────── */}
      <section className="py-16 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-beige-nude-light flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-terracotta" />
                </div>
                <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avis Clients ──────────────────────────────────────── */}
      {homeReviews.length > 0 && (
        <section className="py-20 px-4">
          <div className="container">
            <div className="text-center mb-14">
              <p className="text-terracotta uppercase tracking-widest text-xs mb-2">
                Témoignages
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                Ce que nos clientes disent
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {homeReviews.map((review) => (
                <div
                  key={review.id}
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
                            : "fill-border text-border",
                        )}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}
                  {review.body && (
                    <p className="text-muted text-sm leading-relaxed mb-4">
                      &ldquo;{review.body}&rdquo;
                    </p>
                  )}
                  <p className="text-xs font-medium text-terracotta">
                    {review.authorName}
                    {review.productName && (
                      <span className="text-muted ml-1">
                        · {review.productName}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
