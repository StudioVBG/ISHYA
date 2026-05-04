import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Garantie 2 ans — ISHYA",
  description:
    "Tous les bijoux ISHYA sont garantis 2 ans contre les défauts de fabrication. Découvrez le périmètre, la procédure et les exclusions.",
  alternates: { canonical: "/garantie" },
};

const covered = [
  "Défaut de fabrication (résine, polissage, montage)",
  "Apprêterie défectueuse (fermoir, crochet, anneau)",
  "Décollement ou fissure non liée à un choc",
  "Re-polissage offert pendant 12 mois",
];

const notCovered = [
  "Choc, écrasement, chute",
  "Contact avec produits chimiques (parfum, javel, acétone)",
  "Immersion prolongée (douche, mer, piscine)",
  "Usure normale du plaqué or après 24 mois",
  "Modifications réalisées hors atelier ISHYA",
];

const steps = [
  {
    n: "01",
    title: "Contactez-nous",
    desc: "Écrivez à sav@ishya.fr avec votre numéro de commande, des photos et une description du problème.",
  },
  {
    n: "02",
    title: "Diagnostic",
    desc: "Sous 48 h ouvrées, nous vous indiquons si la garantie s'applique et la marche à suivre.",
  },
  {
    n: "03",
    title: "Retour atelier",
    desc: "Nous vous envoyons une étiquette de retour prépayée. L'atelier intervient en 5 à 10 jours ouvrés.",
  },
  {
    n: "04",
    title: "Réparation ou remplacement",
    desc: "Nous réparons en priorité. Si la pièce n'est pas réparable, nous la remplaçons par une équivalente.",
  },
];

export default function GarantiePage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Engagement ISHYA
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Garantie 2 ans
          </h1>
          <p className="text-muted leading-relaxed">
            Parce qu&apos;un bijou artisanal mérite la confiance, tous les
            bijoux ISHYA sont couverts pendant 24 mois contre les défauts de
            fabrication.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-terracotta/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <h2 className="font-display text-xl">Ce qui est couvert</h2>
              </div>
              <ul className="space-y-3">
                {covered.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                    <span className="text-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-muted/10 text-muted flex items-center justify-center">
                  ✕
                </div>
                <h2 className="font-display text-xl">Ce qui n&apos;est pas couvert</h2>
              </div>
              <ul className="space-y-3">
                {notCovered.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm">
                    <span className="text-muted shrink-0">—</span>
                    <span className="text-muted">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-beige-nude-light/30">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div
                key={s.n}
                className="bg-white rounded-2xl p-6 border border-border/50"
              >
                <p className="font-display text-3xl text-terracotta/30 mb-2">
                  {s.n}
                </p>
                <h3 className="font-display text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl mb-6">
            Garanties légales
          </h2>
          <div className="text-sm text-muted leading-relaxed space-y-4 bg-beige-nude-light/40 rounded-2xl p-6">
            <p>
              La garantie commerciale ISHYA s&apos;ajoute, sans s&apos;y
              substituer, aux garanties légales prévues par le Code de la
              consommation :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">
                  Garantie légale de conformité (art. L.217-3 et suivants) :
                </strong>{" "}
                2 ans à compter de la livraison.
              </li>
              <li>
                <strong className="text-foreground">
                  Garantie des vices cachés (art. 1641 du Code civil) :
                </strong>{" "}
                2 ans à compter de la découverte du vice.
              </li>
            </ul>
            <p>
              Pour exercer ces garanties, écrivez-nous à{" "}
              <a
                href="mailto:sav@ishya.fr"
                className="text-terracotta hover:underline"
              >
                sav@ishya.fr
              </a>
              . Pour toute information complémentaire, consultez nos{" "}
              <Link href="/cgv" className="text-terracotta hover:underline">
                conditions générales de vente
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-foreground text-white text-center">
        <div className="container max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl mb-4">
            Une question sur votre bijou ?
          </h2>
          <p className="text-white/70 mb-8">
            Notre service après-vente est joignable du lundi au vendredi, 9h–18h.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-dark text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Contacter le SAV
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
