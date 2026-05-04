import type { Metadata } from "next";
import Image from "next/image";
import { Gift, Mail, Sparkles, Check } from "lucide-react";
import { CarteCadeauForm } from "./CarteCadeauForm";

export const metadata: Metadata = {
  title: "Carte cadeau ISHYA — Offrir un bijou unique",
  description:
    "Offrez la liberté de choisir : la carte cadeau ISHYA est valable 1 an sur l'ensemble de la boutique. Livrée par email, instantanément.",
  alternates: { canonical: "/carte-cadeau" },
};

const amounts = [30, 50, 80, 120, 200];

const perks = [
  "Valable 12 mois sur l'intégralité de la boutique",
  "Envoyée par email immédiatement (ou à la date que vous choisissez)",
  "Cumulable avec les promotions en cours",
  "Aucun frais, aucune commission",
];

export default function CarteCadeauPage() {
  return (
    <>
      <section className="relative bg-beige-nude-light/50 overflow-hidden">
        <div className="container py-16 lg:py-20 px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-5">
                <Gift className="w-3.5 h-3.5" />
                Carte cadeau
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                Offrir la liberté de choisir
              </h1>
              <p className="text-lg text-muted leading-relaxed mb-8">
                Quand on hésite entre la bague et le collier, la carte cadeau
                ISHYA fait le bon choix pour vous. Valable un an, sans frais,
                envoyée instantanément.
              </p>
              <ul className="space-y-2.5">
                {perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                    <span className="text-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-foreground">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center text-white max-w-xs w-full">
                  <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
                  <p className="font-display text-3xl mb-2">ISHYA</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-6">
                    Carte cadeau
                  </p>
                  <p className="font-display text-5xl text-gold mb-1">80 €</p>
                  <p className="text-xs text-white/60">
                    Valable jusqu&apos;au 04/05/2027
                  </p>
                  <p className="mt-6 text-xs font-mono text-white/40">
                    ISHYA-XXXX-XXXX-XXXX
                  </p>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1100&fit=crop"
                alt=""
                fill
                className="object-cover -z-10 opacity-60"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-2">
            Personnaliser la carte
          </h2>
          <p className="text-center text-muted text-sm mb-10">
            Choisissez le montant, le destinataire et la date d&apos;envoi.
          </p>
          <CarteCadeauForm amounts={amounts} />
        </div>
      </section>

      <section className="py-12 px-4 bg-beige-nude-light/30">
        <div className="container max-w-3xl">
          <h2 className="font-display text-xl md:text-2xl mb-6 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Comment la carte est-elle envoyée ?",
                a: "Par email, à la date que vous choisissez (immédiatement ou plus tard). Le destinataire reçoit un code à utiliser au panier.",
              },
              {
                q: "Quelle est la durée de validité ?",
                a: "12 mois à compter de la date d'achat.",
              },
              {
                q: "Puis-je l'utiliser en plusieurs fois ?",
                a: "Oui : si le montant n'est pas entièrement consommé, le solde reste disponible.",
              },
              {
                q: "Est-elle remboursable ?",
                a: "Conformément à l'article L.221-28 du Code de la consommation, les cartes cadeaux ne sont ni remboursables ni échangeables.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group bg-white border border-border rounded-xl"
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
          <p className="text-center text-xs text-muted mt-6">
            <Mail className="inline w-3.5 h-3.5 mr-1" />
            Une autre question ?{" "}
            <a
              href="mailto:contact@ishya.fr"
              className="text-terracotta hover:underline"
            >
              contact@ishya.fr
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
