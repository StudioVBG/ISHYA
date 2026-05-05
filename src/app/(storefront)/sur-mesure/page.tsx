import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, MessagesSquare, Pencil, Hand, Truck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Sur-mesure & personnalisation — ISHYA",
  description:
    "Bague de fiançailles, alliance, bijou de mariage, fleurs de votre bouquet : nous créons des pièces uniques sur-mesure dans notre atelier parisien.",
  alternates: { canonical: "/sur-mesure" },
};

const occasions = [
  { title: "Mariage", desc: "Capturer les fleurs de votre bouquet dans un bijou éternel." },
  { title: "Naissance", desc: "Une pièce délicate avec la fleur du jour de naissance." },
  { title: "Souvenir", desc: "Vos fleurs séchées (anniversaire, deuil) intégrées avec respect." },
  { title: "Cadeau d'exception", desc: "Une création unique pour les grandes occasions de la vie." },
];

const process = [
  {
    icon: MessagesSquare,
    n: "01",
    title: "Premier échange",
    desc: "Vous nous racontez votre projet par formulaire, email ou rendez-vous visio. Sous 48 h, nous revenons vers vous avec une première intuition.",
  },
  {
    icon: Pencil,
    n: "02",
    title: "Devis & croquis",
    desc: "Nous vous envoyons 2 à 3 propositions illustrées avec un devis détaillé. Aller-retours libres jusqu'à validation.",
  },
  {
    icon: Hand,
    n: "03",
    title: "Création à l'atelier",
    desc: "Réception de vos fleurs (si applicable), séchage, mise en résine, polissage, montage. Comptez 4 à 8 semaines.",
  },
  {
    icon: Truck,
    n: "04",
    title: "Livraison",
    desc: "Photos avant expédition, écrin personnalisé, livraison suivie et assurée. Une carte signée vous accompagne.",
  },
];

export default function SurMesurePage() {
  return (
    <>
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1611601679831-a31b3a3ce437?w=1920&h=900&fit=crop"
          alt="Bijou sur-mesure ISHYA"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Création sur-mesure
          </div>
          <h1 className="font-display text-5xl md:text-6xl mb-6">
            Une pièce unique, comme vous
          </h1>
          <p className="text-lg text-white/90 max-w-xl mx-auto">
            Vos fleurs, votre histoire, notre savoir-faire. Une création à
            quatre mains, pour les moments qui comptent.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
              Pour quelles occasions
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              Quand le sur-mesure prend tout son sens
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {occasions.map((o) => (
              <div
                key={o.title}
                className="bg-white border border-border/50 rounded-2xl p-6"
              >
                <h3 className="font-display text-xl mb-2">{o.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 bg-beige-nude-light/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
              Le déroulé
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              Quatre étapes, six à huit semaines
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.n}
                  className="bg-white rounded-2xl p-6 border border-border/50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-3xl text-terracotta/30">
                      {p.n}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-terracotta" />
                    </div>
                  </div>
                  <h3 className="font-display text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-3xl">
          <div className="bg-beige-nude-light/50 rounded-2xl p-8 sm:p-10 text-center">
            <h2 className="font-display text-2xl md:text-3xl mb-3">
              Budgets indicatifs
            </h2>
            <p className="text-muted mb-8 text-sm">
              Chaque création est unique : ces fourchettes vous donnent un
              repère.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-left">
              {[
                { type: "Boucles d'oreilles", price: "à partir de 180 €" },
                { type: "Pendentif / collier", price: "à partir de 260 €" },
                { type: "Bague", price: "à partir de 320 €" },
              ].map((b) => (
                <div
                  key={b.type}
                  className="bg-white rounded-xl p-5 border border-border/50"
                >
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">
                    {b.type}
                  </p>
                  <p className="font-display text-lg text-terracotta">
                    {b.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-foreground text-white text-center">
        <div className="container max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Démarrer votre projet
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Le premier échange est gratuit et sans engagement. Racontez-nous
            votre projet, nous vous répondons sous 48 h.
          </p>
          <Link href="/contact?sujet=sur-mesure" className="btn-primary gap-2">
            Demander un devis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
