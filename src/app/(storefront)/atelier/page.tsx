import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Flower2,
  Flower,
  Layers,
  Hand,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Notre atelier & savoir-faire — ISHYA",
  description:
    "L'atelier ISHYA à Paris : cueillette, séchage, mise en résine et finition à la main. Quatre étapes, une cadence lente, aucun raccourci.",
  alternates: { canonical: "/atelier" },
};

const stats = [
  { value: "+1 200", label: "pièces créées par an" },
  { value: "48 h", label: "de polymérisation par bijou" },
  { value: "100 %", label: "fait main à Paris" },
  { value: "0", label: "sous-traitance" },
];

const steps = [
  {
    icon: Flower,
    n: "01",
    title: "Cueillette saisonnière",
    desc: "Nous travaillons exclusivement avec des producteurs d'Île-de-France. Roses, hortensias, gypsophiles, fougères, lavande : chaque variété est sélectionnée à maturité parfaite, jamais à l'avance.",
  },
  {
    icon: Sparkles,
    n: "02",
    title: "Séchage lent et naturel",
    desc: "Les fleurs sont déposées tête en bas dans une pièce sombre, à humidité contrôlée, pendant 14 à 28 jours. Aucune chaleur artificielle, aucun produit. C'est ce temps long qui préserve les couleurs.",
  },
  {
    icon: Layers,
    n: "03",
    title: "Mise en résine",
    desc: "Chaque fleur est délicatement positionnée à la pince dans un moule en silicone. La résine époxy bijouterie est coulée en plusieurs passes pour éviter les bulles. Polymérisation : 48 heures à 22 °C.",
  },
  {
    icon: Hand,
    n: "04",
    title: "Polissage & montage",
    desc: "Le bijou est démoulé, poli à la main au papier abrasif fin (jusqu'à grain 5000), puis monté sur une apprêterie en acier inoxydable plaqué or 3 microns. Inspection finale, gravure, écrin.",
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
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=900&fit=crop"
          alt="Atelier ISHYA — création de bijoux floraux"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-6">
            <MapPin className="w-3.5 h-3.5" />
            Paris 11ᵉ
          </div>
          <h1 className="font-display text-5xl md:text-6xl mb-6">
            Notre atelier & savoir-faire
          </h1>
          <p className="text-lg text-white/90 max-w-xl mx-auto">
            Un espace lumineux où la patience devient bijou.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="text-center p-6 bg-beige-nude-light/40 rounded-2xl"
              >
                <p className="font-display text-3xl md:text-4xl text-terracotta mb-1">
                  {s.value}
                </p>
                <p className="text-xs text-muted uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
              Le geste juste
            </p>
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              Quatre étapes, beaucoup de patience
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              De la cueillette à l&apos;écrin, chaque pièce traverse le même
              parcours : aucun raccourci, aucune sous-traitance.
            </p>
          </div>
          <div className="space-y-20">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const reverse = i % 2 === 1;
              return (
                <div
                  key={step.n}
                  className={`grid md:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    reverse ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-beige-nude-light">
                    <Image
                      src={`https://images.unsplash.com/photo-${
                        [
                          "1517248135467-4c7edcad34c4",
                          "1487530811176-3780de880c2d",
                          "1506260408121-e353d10b87c7",
                          "1535632787350-4e68ef0ac584",
                        ][i]
                      }?w=900&h=700&fit=crop`}
                      alt={step.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-display text-5xl text-terracotta/30">
                        {step.n}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-terracotta" />
                      </div>
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl mb-4">
                      {step.title}
                    </h3>
                    <p className="text-muted leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Une journée */}
      <section className="py-16 px-4 bg-beige-nude-light/30">
        <div className="container max-w-3xl text-center">
          <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
            Une journée à l&apos;atelier
          </p>
          <h2 className="font-display text-3xl md:text-4xl mb-12">
            Une cadence lente, choisie
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {moments.map((m, i) => (
              <div
                key={m.title}
                className="bg-white rounded-2xl p-6 border border-border/50"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-terracotta/10 text-terracotta mb-4">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted/70 uppercase tracking-wider mb-1">
                  Étape {i + 1}
                </p>
                <h3 className="font-display text-xl mb-3">{m.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principes */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl text-center">
          <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
            Nos principes
          </p>
          <h2 className="font-display text-3xl md:text-4xl mb-12">
            Trois engagements non négociables
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {principles.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-6 border border-border/50"
              >
                <h3 className="font-display text-xl mb-3">{p.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visite */}
      <section className="py-20 px-4 bg-beige-nude-light/30">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-beige-nude-light">
              <Image
                src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=900&h=1100&fit=crop"
                alt="Mains travaillant la résine"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
                Visiter l&apos;atelier
              </p>
              <h2 className="font-display text-3xl md:text-4xl mb-6">
                Sur rendez-vous uniquement
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                Notre atelier ouvre ses portes une fois par mois pour des
                visites privées de 45 minutes : démonstration de mise en
                résine, présentation des fleurs de saison, rencontre avec
                l&apos;équipe.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Les visites sont gratuites mais le nombre de places est
                limité. Réservez par email.
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

      {/* CTA boutique */}
      <section className="py-16 px-4 bg-foreground text-white">
        <div className="container max-w-2xl text-center">
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-6" />
          <h2 className="font-display text-2xl md:text-3xl mb-4">
            Découvrez nos créations
          </h2>
          <p className="text-white/70 mb-8">
            Chaque bijou ISHYA est unique. Trouvez celui qui vous ressemble.
          </p>
          <Link href="/boutique" className="btn-primary gap-2">
            <Flower2 className="w-4 h-4" />
            Explorer la boutique
          </Link>
        </div>
      </section>
    </>
  );
}
