import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Sparkles, Flower2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Notre atelier parisien — ISHYA",
  description:
    "Découvrez l'atelier ISHYA au cœur de Paris : un espace lumineux où chaque bijou est façonné à la main avec patience et passion.",
  alternates: { canonical: "/atelier" },
};

const stats = [
  { value: "+1 200", label: "pièces créées par an" },
  { value: "48 h", label: "de polymérisation par bijou" },
  { value: "100 %", label: "fait main à Paris" },
  { value: "0", label: "sous-traitance" },
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

export default function AtelierPage() {
  return (
    <>
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
            Notre atelier
          </h1>
          <p className="text-lg text-white/90 max-w-xl mx-auto">
            Un espace lumineux où la patience devient bijou.
          </p>
        </div>
      </section>

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
              <div key={m.title} className="bg-white rounded-2xl p-6 border border-border/50">
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

      <section className="py-20 px-4">
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
