import type { Metadata } from "next";
import { Scale, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Médiation de la consommation — ISHYA",
  description:
    "En cas de litige, ISHYA propose un recours à un médiateur de la consommation conformément aux articles L.611-1 et suivants du Code de la consommation.",
  alternates: { canonical: "/mediation" },
};

export default function MediationPage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            Juridique
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Médiation de la consommation
          </h1>
          <p className="text-muted text-sm">
            Conformément aux articles L.611-1 et suivants du Code de la
            consommation.
          </p>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="container max-w-3xl mx-auto space-y-10">
          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              1. Service client : un dialogue avant tout
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Avant toute saisine d&apos;un médiateur, vous êtes invité(e) à
              contacter notre service client à{" "}
              <a
                href="mailto:contact@ishya.fr"
                className="text-terracotta hover:underline"
              >
                contact@ishya.fr
              </a>{" "}
              afin que nous puissions trouver ensemble une solution amiable.
              Notre équipe s&apos;engage à vous répondre sous 48 heures
              ouvrées.
            </p>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              2. Recours au médiateur de la consommation
            </h2>
            <div className="text-sm text-muted leading-relaxed space-y-3">
              <p>
                Si aucun accord n&apos;est trouvé dans un délai raisonnable,
                vous avez le droit de recourir gratuitement au médiateur de la
                consommation auquel ISHYA SAS adhère :
              </p>
              <div className="bg-beige-nude-light/60 rounded-xl p-6 mt-4">
                <p className="font-medium text-foreground mb-2">
                  CM2C — Centre de la Médiation de la Consommation de
                  Conciliateurs de Justice
                </p>
                <div className="grid sm:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                  <div>
                    <p className="text-xs text-muted/70 uppercase tracking-wider">
                      Adresse
                    </p>
                    <p>14 rue Saint-Jean, 75017 Paris</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted/70 uppercase tracking-wider">
                      Email
                    </p>
                    <p>cm2c@cm2c.net</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted/70 uppercase tracking-wider">
                      Site internet
                    </p>
                    <a
                      href="https://www.cm2c.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terracotta hover:underline inline-flex items-center gap-1"
                    >
                      www.cm2c.net
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              3. Plateforme européenne de règlement en ligne (RLL)
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Pour les achats en ligne dans l&apos;Union européenne, la
              Commission européenne met à disposition une plateforme de
              règlement en ligne des litiges (RLL) :{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta hover:underline inline-flex items-center gap-1"
              >
                ec.europa.eu/consumers/odr
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              4. Conditions de saisine
            </h2>
            <ul className="list-disc pl-5 text-sm text-muted leading-relaxed space-y-2">
              <li>
                Vous devez avoir préalablement tenté de résoudre le litige
                directement avec ISHYA par une réclamation écrite.
              </li>
              <li>
                Le médiateur doit être saisi dans un délai d&apos;un an à
                compter de la réclamation écrite.
              </li>
              <li>
                Le litige ne doit pas être déjà examiné par un autre médiateur
                ou un tribunal.
              </li>
              <li>La médiation est gratuite pour le consommateur.</li>
            </ul>
          </article>

          <article>
            <h2 className="font-display text-xl md:text-2xl mb-4">
              5. Droit applicable
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Le présent dispositif est régi par le droit français. La
              médiation est facultative ; elle ne prive pas le consommateur de
              son droit de saisir les juridictions compétentes.
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
