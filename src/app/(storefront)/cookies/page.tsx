import type { Metadata } from "next";
import { Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique cookies — ISHYA",
  description:
    "Découvrez quels cookies sont utilisés sur ishya.fr, à quoi ils servent et comment gérer votre consentement.",
  alternates: { canonical: "/cookies" },
};

const cookieCategories = [
  {
    name: "Strictement nécessaires",
    consent: "Aucun consentement requis",
    description:
      "Indispensables au fonctionnement du site (panier, session, connexion sécurisée). Ils ne peuvent être désactivés.",
    examples: [
      { name: "sb-access-token", purpose: "Session utilisateur Supabase", duration: "Session" },
      { name: "sb-refresh-token", purpose: "Renouvellement de session", duration: "30 jours" },
      { name: "ishya-cart", purpose: "Persistance du panier invité", duration: "30 jours" },
      { name: "ishya-announcement-dismissed", purpose: "Mémorisation de la fermeture du bandeau", duration: "7 jours" },
    ],
  },
  {
    name: "Mesure d'audience",
    consent: "Consentement requis",
    description:
      "Statistiques anonymes d'utilisation du site afin d'améliorer l'expérience et corriger les bugs.",
    examples: [
      { name: "_va_*", purpose: "Mesure d'audience anonymisée Vercel Analytics", duration: "13 mois" },
    ],
  },
  {
    name: "Marketing & publicité",
    consent: "Consentement requis",
    description:
      "Personnalisation des campagnes (Meta, Pinterest), retargeting et mesure de la performance publicitaire.",
    examples: [
      { name: "_fbp", purpose: "Pixel Meta — attribution publicitaire", duration: "90 jours" },
      { name: "_pin_unauth", purpose: "Pixel Pinterest", duration: "1 an" },
    ],
  },
];

export default function CookiesPage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Cookie className="w-3.5 h-3.5" />
            Confidentialité
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Politique de cookies
          </h1>
          <p className="text-muted text-sm">
            Dernière mise à jour : 4 mai 2026
          </p>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="container max-w-3xl mx-auto space-y-10">
          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              Qu&apos;est-ce qu&apos;un cookie ?
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Un cookie est un petit fichier texte déposé sur votre appareil
              lorsque vous visitez un site internet. Il permet au site de
              retenir vos actions et préférences (connexion, panier, langue) sur
              une durée déterminée. Conformément à la directive ePrivacy et aux
              recommandations CNIL, certains cookies nécessitent votre
              consentement préalable.
            </p>
          </article>

          {cookieCategories.map((cat) => (
            <article key={cat.name}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="font-display text-xl md:text-2xl">{cat.name}</h2>
                <span className="text-[10px] uppercase tracking-wider bg-beige-nude px-2 py-1 rounded font-medium shrink-0">
                  {cat.consent}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-4">
                {cat.description}
              </p>
              <div className="bg-beige-nude-light/50 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-beige-nude/40 text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Nom</th>
                      <th className="text-left px-4 py-3 font-medium">Finalité</th>
                      <th className="text-left px-4 py-3 font-medium">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.examples.map((c, i) => (
                      <tr
                        key={c.name}
                        className={i > 0 ? "border-t border-border/50" : ""}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 text-muted">{c.purpose}</td>
                        <td className="px-4 py-3 text-muted whitespace-nowrap">
                          {c.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              Gérer vos préférences
            </h2>
            <div className="text-sm text-muted leading-relaxed space-y-3">
              <p>
                Vous pouvez à tout moment modifier vos préférences via le
                bandeau de consentement, ou directement dans les réglages de
                votre navigateur (Chrome, Firefox, Safari, Edge).
              </p>
              <p>
                Le retrait du consentement n&apos;affecte pas la licéité du
                traitement effectué avant ce retrait.
              </p>
            </div>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              Durée de conservation & contact
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Les durées de conservation sont indiquées dans les tableaux
              ci-dessus et n&apos;excèdent jamais 13 mois pour les cookies
              soumis à consentement (recommandation CNIL). Pour toute question,
              contactez notre DPO à{" "}
              <a
                href="mailto:dpo@ishya.fr"
                className="text-terracotta hover:underline"
              >
                dpo@ishya.fr
              </a>
              .
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
