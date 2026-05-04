import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Download, ExternalLink, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Espace presse — ISHYA",
  description:
    "Téléchargez le kit presse ISHYA, retrouvez nos retombées média et contactez notre attaché de presse.",
  alternates: { canonical: "/presse" },
};

const press = [
  {
    media: "Vogue France",
    date: "Mars 2026",
    title: "Ces marques de bijoux qui réinventent le fait main",
    url: "#",
  },
  {
    media: "Le Figaro Madame",
    date: "Janvier 2026",
    title: "ISHYA : la fleur séchée, nouveau diamant des bijoux",
    url: "#",
  },
  {
    media: "Marie Claire",
    date: "Novembre 2025",
    title: "Notre sélection de cadeaux artisanaux pour les fêtes",
    url: "#",
  },
  {
    media: "ELLE",
    date: "Septembre 2025",
    title: "Ces 5 créatrices parisiennes que l'on adore",
    url: "#",
  },
];

const assets = [
  { label: "Logo ISHYA — versions PNG/SVG", size: "2,1 Mo" },
  { label: "Visuels HD produits (sélection 2026)", size: "48 Mo" },
  { label: "Photos atelier & équipe (DA)", size: "26 Mo" },
  { label: "Dossier de presse 2026", size: "4,8 Mo" },
];

export default function PressePage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Newspaper className="w-3.5 h-3.5" />
            Espace presse
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Presse & médias
          </h1>
          <p className="text-muted leading-relaxed">
            Bienvenue. Vous trouverez ici notre kit de communication, nos
            retombées presse et le contact direct de notre attaché.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl mb-8">
            Kit presse à télécharger
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {assets.map((a) => (
              <button
                key={a.label}
                className="flex items-center gap-4 bg-white border border-border rounded-xl p-5 text-left hover:border-terracotta transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.label}</p>
                  <p className="text-xs text-muted">{a.size}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-beige-nude-light/30">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl mb-8">
            Ils parlent de nous
          </h2>
          <div className="space-y-3">
            {press.map((p) => (
              <a
                key={p.title}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-border rounded-xl p-5 hover:border-terracotta transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-terracotta uppercase tracking-wider font-medium">
                        {p.media}
                      </span>
                      <span className="text-muted text-xs">·</span>
                      <span className="text-xs text-muted">{p.date}</span>
                    </div>
                    <p className="font-medium">{p.title}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-2xl text-center">
          <Mail className="w-8 h-8 text-terracotta mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl mb-4">
            Contact presse
          </h2>
          <p className="text-muted mb-2">Élise Charron — attachée de presse</p>
          <p className="text-sm">
            <a
              href="mailto:presse@ishya.fr"
              className="text-terracotta hover:underline"
            >
              presse@ishya.fr
            </a>{" "}
            · +33 1 23 45 67 90
          </p>
          <div className="mt-8">
            <Link href="/contact?sujet=presse" className="btn-primary">
              Envoyer un message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
