import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Gem, Sprout, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Nos matériaux — ISHYA",
  description:
    "Origine et qualité des matières utilisées par ISHYA : fleurs cultivées en France, résine époxy hypoallergénique, acier 316L plaqué or 3 microns.",
  alternates: { canonical: "/materiaux" },
};

const materials = [
  {
    icon: Sprout,
    name: "Fleurs séchées",
    sub: "Cultivées en Île-de-France",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&h=900&fit=crop",
    facts: [
      "Producteurs partenaires : 4 fermes en Seine-et-Marne et Yvelines",
      "Variétés : roses, hortensias, gypsophiles, lavande, fougères",
      "Sans pesticides ni traitements de synthèse",
      "Séchage naturel pendant 2 à 4 semaines",
    ],
  },
  {
    icon: Gem,
    name: "Résine époxy",
    sub: "Qualité bijouterie, hypoallergénique",
    image:
      "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=900&h=900&fit=crop",
    facts: [
      "Sans BPA, sans VOC après polymérisation",
      "Conforme REACH (Union européenne)",
      "Indice UV intégré pour limiter le jaunissement",
      "Polymérisation 48 h à 22 °C — aucune chauffe forcée",
    ],
  },
  {
    icon: ShieldCheck,
    name: "Acier inoxydable 316L",
    sub: "Plaqué or 3 microns",
    image:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=900&h=900&fit=crop",
    facts: [
      "Acier chirurgical 316L : sans nickel libre, hypoallergénique",
      "Plaqué or jaune ou rose 3 microns (norme NF EN 1811)",
      "Apprêts français, fournisseur basé à Lyon",
      "Re-plaquage proposé par notre SAV",
    ],
  },
  {
    icon: Leaf,
    name: "Emballage",
    sub: "Recyclable et fabriqué en France",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&h=900&fit=crop",
    facts: [
      "Écrins en carton recyclé certifié FSC",
      "Sachet intérieur en coton bio non blanchi",
      "Encres végétales pour l'impression",
      "Imprimerie Imprim'Vert près d'Orléans",
    ],
  },
];

export default function MateriauxPage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Leaf className="w-3.5 h-3.5" />
            Transparence
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Nos matériaux
          </h1>
          <p className="text-muted leading-relaxed">
            Vous portez nos bijoux à fleur de peau. Vous méritez de savoir
            exactement ce qu&apos;ils contiennent.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container max-w-5xl space-y-20">
          {materials.map((m, i) => {
            const Icon = m.icon;
            const reverse = i % 2 === 1;
            return (
              <div
                key={m.name}
                className={`grid md:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-beige-nude-light">
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-terracotta/10 text-terracotta mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">
                    {m.sub}
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl mb-6">
                    {m.name}
                  </h2>
                  <ul className="space-y-2">
                    {m.facts.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-muted"
                      >
                        <span className="text-terracotta mt-1.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-16 px-4 bg-beige-nude-light/30">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-2xl md:text-3xl mb-4">
            Une transparence totale
          </h2>
          <p className="text-muted mb-8 leading-relaxed">
            Pour chaque produit, l&apos;origine des fleurs et la composition
            précise sont indiquées sur la fiche. Une question sur un bijou
            spécifique ? Écrivez-nous.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/contact" className="btn-secondary">
              Poser une question
            </Link>
            <Link href="/savoir-faire" className="btn-primary">
              Voir notre savoir-faire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
