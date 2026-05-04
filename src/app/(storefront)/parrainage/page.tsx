import type { Metadata } from "next";
import Link from "next/link";
import { Users, Gift, Send, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Parrainage — ISHYA",
  description:
    "Parrainez vos amies, vous gagnez 15 €, elles aussi. Le parrainage ISHYA, c'est doux pour tout le monde.",
  alternates: { canonical: "/parrainage" },
};

const steps = [
  {
    icon: Send,
    n: "01",
    title: "Invitez vos proches",
    desc: "Depuis votre espace client, partagez votre lien personnel par email, SMS ou WhatsApp.",
  },
  {
    icon: Gift,
    n: "02",
    title: "Elles reçoivent 15 €",
    desc: "Vos filleules profitent immédiatement de 15 € sur leur première commande de 60 € minimum.",
  },
  {
    icon: Sparkles,
    n: "03",
    title: "Vous gagnez 15 €",
    desc: "Dès que la commande est livrée et la période de retour passée (14 jours), votre récompense est créditée.",
  },
];

export default function ParrainagePage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 lg:py-20 px-4">
        <div className="container max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-5">
            <Users className="w-3.5 h-3.5" />
            Programme parrainage
          </div>
          <h1 className="font-display text-4xl md:text-6xl mb-6">
            15 € pour vous, 15 € pour elles
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-10 max-w-xl mx-auto">
            Vous nous avez fait confiance. Le plus beau compliment, c&apos;est
            de partager. Récompense pour vous deux, sans limite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/compte/fidelite"
              className="btn-primary inline-flex items-center gap-2"
            >
              Mon lien parrainage
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/inscription" className="btn-secondary">
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
              Comment ça marche
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              Trois étapes, deux gagnants
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="bg-white border border-border/50 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-3xl text-terracotta/30">
                      {s.n}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-terracotta" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl mb-2">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-foreground text-white">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-display text-5xl text-gold mb-2">+2 400</p>
              <p className="text-sm text-white/70 uppercase tracking-wider">
                marraines actives
              </p>
            </div>
            <div>
              <p className="font-display text-5xl text-gold mb-2">36 000 €</p>
              <p className="text-sm text-white/70 uppercase tracking-wider">
                redistribués en 2025
              </p>
            </div>
            <div>
              <p className="font-display text-5xl text-gold mb-2">4,9/5</p>
              <p className="text-sm text-white/70 uppercase tracking-wider">
                satisfaction filleules
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-10">
            Petites règles claires
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Combien de personnes puis-je parrainer ?",
                a: "Sans limite. Chaque filleule = 15 € pour elle, 15 € pour vous.",
              },
              {
                q: "Quand ma récompense est-elle créditée ?",
                a: "14 jours après la livraison de la commande de votre filleule, dès que la période de retour est expirée.",
              },
              {
                q: "Mon code peut-il être cumulé avec d'autres promotions ?",
                a: "Le code parrainage n'est pas cumulable avec d'autres codes promo, mais il s'applique aux nouveautés et best-sellers.",
              },
              {
                q: "Que se passe-t-il en cas de retour ?",
                a: "Si la commande est intégralement retournée, la récompense parrain est annulée. En cas de retour partiel laissant la commande au-dessus de 60 €, la récompense est conservée.",
              },
              {
                q: "Puis-je me parrainer moi-même avec une autre adresse ?",
                a: "Non. Toute tentative d'auto-parrainage entraîne l'annulation des récompenses concernées.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group bg-beige-nude-light/40 rounded-xl"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-sm font-medium">
                  {f.q}
                  <span className="text-muted group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
