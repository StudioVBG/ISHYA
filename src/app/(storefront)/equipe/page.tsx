import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Users, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "L'équipe ISHYA — Les visages derrière les bijoux",
  description:
    "Rencontrez l'équipe ISHYA : artisans, créatrices et passionnés qui donnent vie à chaque bijou floral dans notre atelier parisien.",
  alternates: { canonical: "/equipe" },
};

const team = [
  {
    name: "Camille Laurent",
    role: "Fondatrice & directrice de création",
    bio: "Ancienne fleuriste devenue bijoutière, Camille a fondé ISHYA en 2022 pour fixer dans la résine la beauté éphémère des fleurs.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
  },
  {
    name: "Léa Mercier",
    role: "Cheffe d'atelier",
    bio: "10 ans d'expérience en joaillerie. Léa supervise la mise en résine, le polissage et le contrôle qualité de chaque pièce.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop",
  },
  {
    name: "Inès Dupont",
    role: "Artisane bijoutière",
    bio: "Diplômée des Métiers d'Art à Saumur. Inès maîtrise la composition florale et la délicatesse du geste.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=600&fit=crop",
  },
  {
    name: "Tom Bernard",
    role: "Service client & SAV",
    bio: "Le sourire ISHYA au téléphone et par email. Tom répond, conseille et accompagne chaque commande.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop",
  },
  {
    name: "Sophie Aubry",
    role: "Direction commerciale",
    bio: "Stratégie, partenariats, e-commerce. Sophie veille à ce que la marque grandisse sans renoncer à son artisanat.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop",
  },
  {
    name: "Marie Thibault",
    role: "Photographe & direction artistique",
    bio: "Lumière, mise en scène, contenus. Marie capture l'âme de chaque bijou pour vous le donner à voir.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop",
  },
];

export default function EquipePage() {
  return (
    <>
      <section className="bg-bone-soft/50 py-16 px-4">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-ember/10 text-ember-deep px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5" />
            Notre équipe
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4">
            Les visages d&apos;ISHYA
          </h1>
          <p className="text-steel leading-relaxed">
            Six artisans et passionnés réunis dans un même atelier parisien.
            Voici les mains qui façonnent chaque bijou.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {team.map((member) => (
              <article
                key={member.name}
                className="group bg-bone-soft border border-border/50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-bone-soft">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl mb-1">{member.name}</h3>
                  <p className="text-xs text-ember uppercase tracking-wider font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-steel leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-ink text-bone text-center">
        <div className="container max-w-2xl">
          <Sparkles className="w-8 h-8 text-ember mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Envie de nous rejoindre ?
          </h2>
          <p className="text-bone/70 mb-8">
            Nous cherchons régulièrement des artisans, photographes et
            stagiaires qui partagent notre passion du fait main.
          </p>
          <Link href="/recrutement" className="btn-primary">
            Voir nos offres
          </Link>
        </div>
      </section>
    </>
  );
}
