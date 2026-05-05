import Link from "next/link";
import { Flower2, Home, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Page introuvable — ISHYA",
  description:
    "La page que vous cherchez n'existe pas ou a été déplacée. Découvrez nos collections de bijoux floraux artisanaux.",
  robots: { index: false, follow: false },
};

export default function StorefrontNotFound() {
  return (
    <section className="flex items-center justify-center py-20 px-4 bg-beige-nude-light/30">
      <div className="container max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-terracotta/10 mb-8">
          <Flower2 className="w-9 h-9 text-terracotta" />
        </div>
        <p className="text-terracotta uppercase tracking-[0.2em] text-xs font-medium mb-3">
          Erreur 404
        </p>
        <h1 className="font-display text-5xl md:text-6xl mb-6">
          Page introuvable
        </h1>
        <p className="text-muted leading-relaxed mb-10 max-w-md mx-auto">
          La page que vous cherchez n&apos;existe pas, a été déplacée ou
          n&apos;est plus disponible. Reprenons votre balade au cœur de notre
          collection.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/boutique"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Voir la boutique
          </Link>
        </div>

        <div className="mt-16 pt-10 border-t border-border">
          <p className="text-xs text-muted uppercase tracking-wider mb-4">
            Liens utiles
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/boutique?badge=nouveau" className="hover:text-terracotta transition-colors">
              Nouveautés
            </Link>
            <Link href="/boutique?badge=best-seller" className="hover:text-terracotta transition-colors">
              Best-sellers
            </Link>
            <Link href="/boutique?type=pack" className="hover:text-terracotta transition-colors">
              Packs
            </Link>
            <Link href="/aide" className="hover:text-terracotta transition-colors">
              Aide
            </Link>
            <Link href="/contact" className="hover:text-terracotta transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
