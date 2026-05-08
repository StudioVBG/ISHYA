import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Flower2 } from "lucide-react";
import { AtelierProcessSteps, type AtelierStep } from "@/components/atelier/AtelierProcessSteps";

export const metadata: Metadata = {
  title: "Notre atelier & savoir-faire — ISHYA",
  description:
    "L'atelier ISHYA à Paris : cueillette, séchage, mise en résine et finition à la main. Quatre étapes, une cadence lente, aucun raccourci.",
  alternates: { canonical: "/atelier" },
};

const stats = [
  { value: "1 200", label: "pièces créées par an" },
  { value: "48 h", label: "polymérisation par bijou" },
  { value: "100", label: "% fait main à Paris" },
  { value: "00", label: "sous-traitance" },
];

const steps: AtelierStep[] = [
  {
    n: "01",
    title: "Cueillette saisonnière",
    desc: "Nous travaillons exclusivement avec des producteurs d'Île-de-France. Roses, hortensias, gypsophiles, fougères, lavande : chaque variété est sélectionnée à maturité parfaite, jamais à l'avance.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&h=1000&fit=crop",
  },
  {
    n: "02",
    title: "Séchage lent et naturel",
    desc: "Les fleurs sont déposées tête en bas dans une pièce sombre, à humidité contrôlée, pendant 14 à 28 jours. Aucune chaleur artificielle, aucun produit. C'est ce temps long qui préserve les couleurs.",
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1400&h=1000&fit=crop",
  },
  {
    n: "03",
    title: "Mise en résine",
    desc: "Chaque fleur est délicatement positionnée à la pince dans un moule en silicone. La résine époxy bijouterie est coulée en plusieurs passes pour éviter les bulles. Polymérisation : 48 heures à 22 °C.",
    image: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=1400&h=1000&fit=crop",
  },
  {
    n: "04",
    title: "Polissage & montage",
    desc: "Le bijou est démoulé, poli à la main au papier abrasif fin (jusqu'à grain 5000), puis monté sur une apprêterie en acier inoxydable plaqué or 3 microns. Inspection finale, gravure, écrin.",
    image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1400&h=1000&fit=crop",
  },
];

const moments = [
  {
    title: "Le matin",
    desc: "Sélection des fleurs reçues la veille de nos producteurs d'Île-de-France. Tri par couleur, taille, fragilité.",
  },
  {
    title: "L'après-midi",
    desc: "Découpe des moules silicone, mise en place minutieuse des fleurs, coulée de la résine époxy de qualité bijouterie.",
  },
  {
    title: "Le soir",
    desc: "Polissage à la main, vérification une à une, écrin individuel et préparation des commandes du lendemain.",
  },
];

const principles = [
  {
    title: "Pas de production en série",
    desc: "Aucune pièce n'est identique : la fleur dicte la forme. Notre cadence : 30 à 50 bijoux par semaine, jamais plus.",
  },
  {
    title: "Matières contrôlées",
    desc: "Résine époxy hypoallergénique sans BPA, apprêts en acier 316L plaqué or, fleurs cultivées sans pesticides.",
  },
  {
    title: "Zéro fleur gâchée",
    desc: "Les chutes de résine et fleurs cassées alimentent nos pièces uniques en série limitée et nos cartes-cadeaux décoratives.",
  },
];

export default function AtelierPage() {
  return (
    <>
      {/* ── Hero asymétrique 33/67 sur fond ink ────────────────── */}
      <section className="relative bg-ink text-bone overflow-hidden">
        <div className="grid grid-cols-12 min-h-[80svh] gap-y-12 md:gap-y-0">
          <div className="col-span-12 md:col-span-5 lg:col-span-4 lg:col-start-2 flex flex-col justify-end pt-32 md:pt-24 pb-16 md:pb-24 px-(--gutter)">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-10 bg-ember" aria-hidden />
              <span className="eyebrow text-bone/70">
                <MapPin className="inline w-3 h-3 mr-1.5 -mt-0.5" />
                Paris 11ᵉ · Atelier
              </span>
            </div>
            <h1
              className="font-display text-bone mb-8 leading-[1.02] tracking-[-0.035em]"
              style={{
                fontSize: "var(--text-h1)",
                fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
                fontWeight: 380,
              }}
            >
              Un espace lumineux où la patience devient bijou.
            </h1>
            <p className="text-lg md:text-xl text-bone/65 max-w-md leading-snug">
              Quatre étapes, aucune sous-traitance, une seule cadence : celle du
              geste juste.
            </p>
          </div>

          <div className="col-span-12 md:col-span-7 lg:col-span-6 relative aspect-[4/5] md:aspect-auto md:h-full">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1200&fit=crop"
              alt="Atelier ISHYA — création de bijoux floraux"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            <div className="absolute inset-y-0 left-0 w-px bg-ember/40 hidden md:block" aria-hidden />
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-3 text-bone/80">
              <span className="font-mono text-xs tracking-widest">N° ATELIER · 11ᵉ</span>
              <span className="h-px w-8 bg-bone/40" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats — bandeau éditorial ──────────────────────────── */}
      <section className="border-y border-border py-14 md:py-20 px-(--gutter)">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <span
                  className="font-display text-ink leading-none mb-3"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                    fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
                    fontWeight: 380,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.value}
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-steel">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process steps : scrollytelling pin horizontal desktop ── */}
      <AtelierProcessSteps steps={steps} />

      {/* ── Une journée à l'atelier ────────────────────────────── */}
      <section className="py-24 md:py-32 px-(--gutter) bg-bone">
        <div className="container max-w-5xl">
          <div className="mb-14 md:mb-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-ember" aria-hidden />
              <span className="eyebrow">Une journée à l&apos;atelier</span>
            </div>
            <h2
              className="font-display text-ink max-w-2xl"
              style={{
                fontSize: "var(--text-h2)",
                fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 0",
                fontWeight: 400,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              Une cadence lente, choisie.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {moments.map((m, i) => (
              <div key={m.title} className="border-t border-ink pt-6">
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-ember tabular-nums mb-4 block">
                  {String(i + 1).padStart(2, "0")} / 03
                </span>
                <h3
                  className="font-display text-ink mb-4"
                  style={{
                    fontSize: "var(--text-h4)",
                    fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 0",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  {m.title}
                </h3>
                <p className="text-steel leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principes — engagements non négociables ────────────── */}
      <section className="py-24 md:py-32 px-(--gutter) bg-bone-soft border-y border-border">
        <div className="container max-w-5xl">
          <div className="mb-14 md:mb-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-ember" aria-hidden />
              <span className="eyebrow">Manifeste</span>
            </div>
            <h2
              className="font-display text-ink max-w-2xl"
              style={{
                fontSize: "var(--text-h2)",
                fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
                fontWeight: 400,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              Trois engagements <em className="italic text-ember" style={{ fontStyle: "italic" }}>non négociables.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-x-10 gap-y-12">
            {principles.map((p, i) => (
              <div key={p.title} className="border-t border-ink pt-6">
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-steel tabular-nums mb-4 block">
                  Engagement {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="font-display text-ink mb-4"
                  style={{
                    fontSize: "var(--text-h4)",
                    fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 0",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  {p.title}
                </h3>
                <p className="text-steel leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visite atelier — split éditorial ───────────────────── */}
      <section className="py-24 md:py-32 px-(--gutter) bg-bone">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-[1fr_1fr] gap-10 md:gap-16 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] overflow-hidden bg-bone-soft">
              <Image
                src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=1100&h=1400&fit=crop"
                alt="Mains travaillant la résine"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-y-0 left-0 w-px bg-ember/40 hidden md:block" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-ember" aria-hidden />
                <span className="eyebrow">Visiter l&apos;atelier</span>
              </div>
              <h2
                className="font-display text-ink mb-6"
                style={{
                  fontSize: "var(--text-h2)",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
                  fontWeight: 400,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
                }}
              >
                Sur rendez-vous uniquement.
              </h2>
              <p className="text-steel leading-relaxed mb-5 text-base md:text-lg">
                Notre atelier ouvre ses portes une fois par mois pour des
                visites privées de 45 minutes : démonstration de mise en résine,
                présentation des fleurs de saison, rencontre avec l&apos;équipe.
              </p>
              <p className="text-steel leading-relaxed mb-10 text-base">
                Les visites sont gratuites mais le nombre de places est limité.
                Réservez par email.
              </p>
              <Link
                href="/contact?sujet=visite-atelier"
                className="btn-primary inline-flex items-center gap-2"
              >
                Demander une visite
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA boutique — fond ink, accent ember ──────────────── */}
      <section className="py-20 md:py-28 px-(--gutter) bg-ink text-bone">
        <div className="container max-w-3xl text-center">
          <Sparkles className="w-7 h-7 text-ember mx-auto mb-8" />
          <h2
            className="font-display text-bone mb-6"
            style={{
              fontSize: "var(--text-h2)",
              fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 1",
              fontWeight: 400,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            Découvrez nos créations.
          </h2>
          <p className="text-bone/60 mb-10 max-w-xl mx-auto">
            Chaque bijou ISHYA est unique. Trouvez celui qui vous ressemble.
          </p>
          <Link href="/boutique" className="btn-ember inline-flex items-center gap-2">
            <Flower2 className="w-4 h-4" />
            Explorer la boutique
          </Link>
        </div>
      </section>
    </>
  );
}
