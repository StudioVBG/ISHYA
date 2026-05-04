import type { Metadata } from "next";
import { Suspense } from "react";
import { MailX } from "lucide-react";
import { DesinscriptionForm } from "./DesinscriptionForm";

export const metadata: Metadata = {
  title: "Désinscription newsletter — ISHYA",
  description:
    "Désinscrivez-vous de la newsletter ISHYA en un clic. Conforme RGPD.",
  alternates: { canonical: "/desinscription" },
  robots: { index: false, follow: false },
};

export default function DesinscriptionPage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <MailX className="w-3.5 h-3.5" />
            Newsletter
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Désinscription
          </h1>
          <p className="text-muted text-sm">
            Plus de newsletter, plus de spam. Confirmez votre choix ci-dessous.
          </p>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="container max-w-md mx-auto">
          <Suspense fallback={null}>
            <DesinscriptionForm />
          </Suspense>

          <p className="mt-10 text-xs text-muted text-center leading-relaxed">
            Conformément au RGPD, votre demande sera traitée immédiatement et
            votre adresse email retirée de toutes nos listes de diffusion sous
            72 heures. Pour toute question, contactez{" "}
            <a
              href="mailto:dpo@ishya.fr"
              className="text-terracotta hover:underline"
            >
              dpo@ishya.fr
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
