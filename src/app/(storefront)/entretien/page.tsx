import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Droplet, Sun, Wind, Heart, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Entretien de vos bijoux — ISHYA",
  description:
    "Comment entretenir vos bijoux floraux ISHYA pour qu'ils gardent leur éclat des années : conseils précieux et gestes à éviter.",
  alternates: { canonical: "/entretien" },
};

const dos = [
  {
    icon: Wind,
    title: "Rangez à l'abri",
    desc: "Conservez vos bijoux dans leur écrin ISHYA, à l'abri de la lumière directe et de l'humidité.",
  },
  {
    icon: Droplet,
    title: "Nettoyage doux",
    desc: "Un chiffon microfibre sec ou légèrement humide suffit. Séchez immédiatement après contact avec l'eau.",
  },
  {
    icon: Heart,
    title: "Mettez-les en dernier",
    desc: "Parfum, crème, laque : appliquez avant d'enfiler vos bijoux. La résine et le plaqué or vous remercieront.",
  },
];

const donts = [
  "Ne pas immerger dans l'eau (douche, piscine, mer, sauna)",
  "Pas de produits ménagers, javel, alcool, acétone, parfum direct",
  "Pas de chaleur excessive : voiture en plein été, hammam, bord de cheminée",
  "Pas de chocs : la résine est solide mais peut se fissurer en cas d'impact violent",
  "Pas d'ultrasons (nettoyeurs à bijoux) : ils altèrent la résine et le plaqué",
];

const symptoms = [
  {
    title: "Plaqué or terni",
    cause: "Contact répété avec parfum, transpiration ou eau chlorée.",
    fix: "Frottez doucement avec un chiffon spécifique pour métaux précieux. Pour un re-plaquage complet, contactez notre SAV.",
  },
  {
    title: "Résine ternie ou rayée",
    cause: "Frottement contre une surface dure ou produit chimique.",
    fix: "Une micro-rayure superficielle peut être atténuée par polissage à l'atelier. Service offert pendant 2 ans.",
  },
  {
    title: "Couleur de fleur qui change",
    cause: "Les fleurs naturelles évoluent légèrement avec le temps : c'est normal et fait partie du charme.",
    fix: "Aucun fix : c'est la signature d'un bijou vivant. Évitez simplement les UV directs prolongés.",
  },
];

export default function EntretienPage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Guide d&apos;entretien
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Prendre soin de vos bijoux
          </h1>
          <p className="text-muted leading-relaxed">
            Un bijou ISHYA bien entretenu se transmet. Voici les gestes
            simples qui le feront durer des années.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-10">
            Les bons gestes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {dos.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  className="bg-white border border-border/50 rounded-2xl p-6"
                >
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-terracotta/10 text-terracotta mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg mb-2">{d.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-beige-nude-light/30">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl">À éviter</h2>
          </div>
          <ul className="space-y-3">
            {donts.map((d) => (
              <li
                key={d}
                className="flex items-start gap-3 bg-white rounded-xl p-4 border border-border/50"
              >
                <span className="text-destructive mt-0.5">✕</span>
                <span className="text-sm text-foreground">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-10">
            Symptômes & solutions
          </h2>
          <div className="space-y-4">
            {symptoms.map((s) => (
              <details
                key={s.title}
                className="group bg-white border border-border rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-foreground">{s.title}</span>
                  <span className="text-muted group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted leading-relaxed space-y-2">
                  <p>
                    <strong className="text-foreground">Cause : </strong>
                    {s.cause}
                  </p>
                  <p>
                    <strong className="text-foreground">Que faire : </strong>
                    {s.fix}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-foreground text-white text-center">
        <div className="container max-w-2xl">
          <Sun className="w-8 h-8 text-gold mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl mb-4">
            Garantie 2 ans
          </h2>
          <p className="text-white/70 mb-8">
            Tous nos bijoux sont garantis 2 ans contre les défauts de
            fabrication. Découvrez les détails de notre garantie.
          </p>
          <Link
            href="/garantie"
            className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-dark text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Voir la garantie
          </Link>
        </div>
      </section>
    </>
  );
}
