import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Star, Gift, Heart, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Programme fidélité — ISHYA",
  description:
    "Cumulez des points à chaque commande, débloquez des avantages exclusifs et accédez à nos pré-ventes. 3 niveaux : Petale, Florale, Précieuse.",
  alternates: { canonical: "/programme-fidelite" },
};

const tiers = [
  {
    name: "Petale",
    sub: "0 € à 199 €",
    icon: Star,
    color: "from-beige-nude to-beige-nude/60",
    perks: [
      "1 point par € dépensé",
      "Accès à notre newsletter exclusive",
      "Cadeau d'anniversaire surprise",
      "10 % sur votre première commande",
    ],
  },
  {
    name: "Florale",
    sub: "200 € à 499 € cumulés",
    icon: Heart,
    color: "from-terracotta/30 to-terracotta/20",
    featured: true,
    perks: [
      "1,5 point par € dépensé",
      "Livraison offerte sans minimum",
      "-10 % en permanence sur la boutique",
      "Pré-vente des nouvelles collections (48 h en avance)",
    ],
  },
  {
    name: "Précieuse",
    sub: "500 € et plus cumulés",
    icon: Crown,
    color: "from-gold/30 to-gold/15",
    perks: [
      "2 points par € dépensé",
      "Livraison express offerte",
      "-15 % toute l'année",
      "Invitation aux événements privés à l'atelier",
      "Service de personnalisation gratuit (gravure)",
    ],
  },
];

const rewards = [
  { points: 100, reward: "5 € de réduction" },
  { points: 250, reward: "Boucles d'oreilles offertes" },
  { points: 500, reward: "Bracelet ou bague offert (au choix)" },
  { points: 1000, reward: "Pièce sur-mesure offerte (création unique)" },
];

export default function ProgrammeFidelitePage() {
  return (
    <>
      <section className="bg-foreground text-white py-16 lg:py-20 px-4">
        <div className="container max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Programme fidélité
          </div>
          <h1 className="font-display text-4xl md:text-6xl mb-6">
            La famille ISHYA
          </h1>
          <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-xl mx-auto">
            Cumulez des points à chaque commande, débloquez des récompenses,
            recevez des invitations privées. Plus vous nous lisez, plus vous
            êtes choyée.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-dark text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Rejoindre le programme
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
              Trois niveaux
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              Plus vous montez, plus c&apos;est doux
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`relative rounded-3xl p-8 bg-gradient-to-br ${tier.color} border ${
                    tier.featured
                      ? "border-terracotta/40 shadow-md"
                      : "border-border/40"
                  }`}
                >
                  {tier.featured && (
                    <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider bg-terracotta text-white px-2 py-1 rounded-full font-medium">
                      Le plus populaire
                    </span>
                  )}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/70 mb-5">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-2xl mb-1">{tier.name}</h3>
                  <p className="text-xs text-muted uppercase tracking-wider mb-5">
                    {tier.sub}
                  </p>
                  <ul className="space-y-2.5">
                    {tier.perks.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 bg-beige-nude-light/30">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <Gift className="w-8 h-8 text-terracotta mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl mb-3">
              Échangez vos points
            </h2>
            <p className="text-muted">
              1 € dépensé = 1 point (×1,5 ou ×2 selon votre niveau).
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {rewards.map((r, i) => (
              <div
                key={r.points}
                className={`flex items-center justify-between p-5 ${
                  i > 0 ? "border-t border-border/50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
                    <span className="font-display text-lg text-terracotta">
                      {r.points}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{r.reward}</p>
                    <p className="text-xs text-muted">{r.points} points</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-8">
            Les règles, en deux phrases
          </h2>
          <div className="space-y-3 text-sm text-muted leading-relaxed">
            <p>
              Les points sont crédités automatiquement 14 jours après livraison
              (le temps que la période de retour passe). Ils sont valables 24
              mois et expirent en cas d&apos;inactivité de 12 mois sur le compte.
              Le passage de niveau est calculé sur les achats des 12 derniers
              mois glissants.
            </p>
            <p>
              Les avantages ne sont pas cumulables avec certaines opérations
              commerciales (Black Friday, soldes flash). Le programme peut
              évoluer ; les détenteurs sont prévenus 30 jours à l&apos;avance.
              Plus de détails dans nos{" "}
              <Link href="/cgv" className="text-terracotta hover:underline">
                CGV
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
