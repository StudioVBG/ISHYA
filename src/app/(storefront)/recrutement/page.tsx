import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Rejoindre l'équipe — ISHYA",
  description:
    "Rejoignez ISHYA : artisans, créatifs et passionnés bienvenus dans notre atelier parisien. Consultez nos offres en cours.",
  alternates: { canonical: "/recrutement" },
};

const jobs = [
  {
    slug: "artisan-bijoutier-h-f",
    title: "Artisan(e) bijoutier(ère)",
    location: "Paris 11ᵉ",
    type: "CDI · Temps plein",
    posted: "Publié il y a 5 jours",
    summary:
      "Vous maîtrisez la mise en résine et le polissage. Vous rejoignez Léa pour porter notre cadence à 60 pièces / semaine.",
  },
  {
    slug: "stage-photographie-da",
    title: "Stagiaire photographie & DA",
    location: "Paris 11ᵉ",
    type: "Stage 4 à 6 mois",
    posted: "Publié il y a 12 jours",
    summary:
      "Vous accompagnez Marie sur les shootings produits, le contenu Instagram et les coulisses atelier.",
  },
  {
    slug: "responsable-service-client",
    title: "Responsable service client",
    location: "Paris 11ᵉ — partiellement télétravail",
    type: "CDI · Temps plein",
    posted: "Publié il y a 3 semaines",
    summary:
      "Vous structurez notre SAV avec Tom : tickets, retours, suivi commandes, satisfaction post-livraison.",
  },
];

const values = [
  {
    title: "Petite équipe, vrais liens",
    desc: "Sept personnes aujourd'hui. On se connaît, on se choisit, on se respecte.",
  },
  {
    title: "Pas de course folle",
    desc: "On préfère faire bien, lentement, que beaucoup, mal. Cela vaut aussi pour nos collaborateurs.",
  },
  {
    title: "Apprendre tous les jours",
    desc: "Budget formation, visites de musées et fournisseurs, masterclass internes mensuelles.",
  },
];

export default function RecrutementPage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            Recrutement
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Rejoindre l&apos;atelier
          </h1>
          <p className="text-muted leading-relaxed">
            Si l&apos;artisanat, la fleur et le geste lent vous parlent : nous
            sommes peut-être faits pour travailler ensemble.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl mb-8">
            Offres ouvertes
          </h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <article
                key={job.slug}
                className="bg-white border border-border rounded-2xl p-6 hover:border-terracotta transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl mb-2">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mb-3">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {job.type}
                      </span>
                      <span>{job.posted}</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {job.summary}
                    </p>
                  </div>
                  <Link
                    href={`mailto:rh@ishya.fr?subject=Candidature%20${encodeURIComponent(
                      job.title,
                    )}`}
                    className="btn-primary text-sm inline-flex items-center gap-2 shrink-0"
                  >
                    Postuler
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-beige-nude-light/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <Heart className="w-7 h-7 text-terracotta mx-auto mb-3" />
            <h2 className="font-display text-2xl md:text-3xl">
              Travailler ici, c&apos;est…
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white border border-border/50 rounded-2xl p-6"
              >
                <h3 className="font-display text-lg mb-3">{v.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-2xl text-center">
          <h2 className="font-display text-2xl md:text-3xl mb-4">
            Candidature spontanée
          </h2>
          <p className="text-muted mb-8 leading-relaxed">
            Aucune offre ne correspond mais notre univers vous parle ? Écrivez-nous, on lit tout.
          </p>
          <a
            href="mailto:rh@ishya.fr?subject=Candidature%20spontan%C3%A9e"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            rh@ishya.fr
          </a>
        </div>
      </section>
    </>
  );
}
