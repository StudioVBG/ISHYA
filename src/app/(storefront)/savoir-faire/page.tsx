import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flower, Sparkles, Layers, Hand } from "lucide-react";

export const metadata: Metadata = {
  title: "Notre savoir-faire — ISHYA",
  description:
    "Découvrez le processus artisanal ISHYA : cueillette, séchage naturel, mise en résine et finition à la main de chaque bijou floral.",
  alternates: { canonical: "/savoir-faire" },
};

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

export default function SavoirFairePage() {
  return (
    <>
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&h=900&fit=crop"
          alt="Fleurs séchées dans l'atelier ISHYA"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs mb-4 text-white/80">
            Le geste juste
          </p>
          <h1 className="font-display text-5xl md:text-6xl mb-6">
            Notre savoir-faire
          </h1>
          <p className="text-lg text-white/90 max-w-xl mx-auto">
            Quatre étapes, beaucoup de patience, aucun raccourci.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container max-w-5xl space-y-20">
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
                      ["1517248135467-4c7edcad34c4", "1487530811176-3780de880c2d", "1506260408121-e353d10b87c7", "1535632787350-4e68ef0ac584"][i]
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
                  <h2 className="font-display text-3xl md:text-4xl mb-4">
                    {step.title}
                  </h2>
                  <p className="text-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-20 px-4 bg-beige-nude-light/30">
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

      <section className="py-16 px-4">
        <div className="container max-w-2xl text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Curieuse d&apos;en voir plus ?
          </h2>
          <p className="text-muted mb-8">
            Visitez notre atelier parisien sur rendez-vous, ou plongez dans nos
            collections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/atelier" className="btn-secondary inline-flex items-center gap-2">
              Notre atelier
            </Link>
            <Link href="/boutique" className="btn-primary inline-flex items-center gap-2">
              Voir les bijoux
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
