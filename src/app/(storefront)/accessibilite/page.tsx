import type { Metadata } from "next";
import { Accessibility } from "lucide-react";

export const metadata: Metadata = {
  title: "Déclaration d'accessibilité — ISHYA",
  description:
    "ISHYA s'engage à rendre son site internet accessible au plus grand nombre conformément à la loi n° 2005-102 et au RGAA.",
  alternates: { canonical: "/accessibilite" },
};

export default function AccessibilitePage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Accessibility className="w-3.5 h-3.5" />
            Inclusion
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Déclaration d&apos;accessibilité
          </h1>
          <p className="text-muted text-sm">
            Conformité partielle — version publiée le 4 mai 2026.
          </p>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="container max-w-3xl mx-auto space-y-10">
          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              Notre engagement
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              ISHYA SAS s&apos;engage à rendre son site internet accessible
              conformément à l&apos;article 47 de la loi n° 2005-102 du 11
              février 2005 et au Référentiel Général d&apos;Amélioration de
              l&apos;Accessibilité (RGAA) version 4.1.2.
            </p>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              État de conformité
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-4">
              Le site <strong>www.ishya.fr</strong> est en{" "}
              <strong className="text-gold-dark">conformité partielle</strong>{" "}
              avec le RGAA 4.1.2 en raison des non-conformités et dérogations
              listées ci-dessous.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-beige-nude-light/60 rounded-xl p-5 text-center">
                <p className="font-display text-3xl text-terracotta mb-1">
                  68 %
                </p>
                <p className="text-xs text-muted uppercase tracking-wider">
                  Critères conformes
                </p>
              </div>
              <div className="bg-beige-nude-light/60 rounded-xl p-5 text-center">
                <p className="font-display text-3xl text-gold-dark mb-1">
                  18 %
                </p>
                <p className="text-xs text-muted uppercase tracking-wider">
                  Non-conformités
                </p>
              </div>
              <div className="bg-beige-nude-light/60 rounded-xl p-5 text-center">
                <p className="font-display text-3xl text-muted mb-1">14 %</p>
                <p className="text-xs text-muted uppercase tracking-wider">
                  Non applicables
                </p>
              </div>
            </div>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              Non-conformités identifiées
            </h2>
            <ul className="list-disc pl-5 text-sm text-muted leading-relaxed space-y-2">
              <li>
                Certaines images de produits ne disposent pas encore de texte
                alternatif détaillé.
              </li>
              <li>
                Le contraste de quelques boutons secondaires ne respecte pas le
                ratio AA (correction prévue au prochain cycle de design).
              </li>
              <li>
                Les vidéos d&apos;atelier ne disposent pas de transcription
                texte ; un sous-titrage est en cours de production.
              </li>
            </ul>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              Technologies utilisées pour l&apos;évaluation
            </h2>
            <ul className="list-disc pl-5 text-sm text-muted leading-relaxed space-y-1">
              <li>HTML, CSS, JavaScript (Next.js, React)</li>
              <li>Lecteurs d&apos;écran : NVDA 2025.1, VoiceOver iOS 18</li>
              <li>Navigateurs : Firefox 128, Chrome 130, Safari 18</li>
              <li>Outils : Axe DevTools, WAVE, Lighthouse</li>
            </ul>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              Signaler un défaut d&apos;accessibilité
            </h2>
            <div className="text-sm text-muted leading-relaxed space-y-3">
              <p>
                Si vous rencontrez un défaut d&apos;accessibilité empêchant
                l&apos;accès à un contenu ou à une fonctionnalité, contactez
                notre référent accessibilité :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Email :{" "}
                  <a
                    href="mailto:accessibilite@ishya.fr"
                    className="text-terracotta hover:underline"
                  >
                    accessibilite@ishya.fr
                  </a>
                </li>
                <li>Téléphone : +33 1 23 45 67 89 (du lundi au vendredi, 9h-18h)</li>
              </ul>
              <p>
                Une réponse vous sera apportée sous 10 jours ouvrés. Si la
                réponse ne vous convient pas, vous pouvez saisir le Défenseur
                des droits :{" "}
                <a
                  href="https://www.defenseurdesdroits.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terracotta hover:underline"
                >
                  defenseurdesdroits.fr
                </a>
                .
              </p>
            </div>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              Plan d&apos;amélioration
            </h2>
            <ol className="list-decimal pl-5 text-sm text-muted leading-relaxed space-y-2">
              <li>Audit RGAA complet par un cabinet externe (T3 2026)</li>
              <li>Refonte des composants formulaires pour un meilleur support clavier</li>
              <li>
                Génération automatique d&apos;alt-text pour le catalogue à
                partir des fiches produit
              </li>
              <li>Sous-titrage de l&apos;ensemble des vidéos d&apos;atelier</li>
            </ol>
          </article>
        </div>
      </div>
    </>
  );
}
