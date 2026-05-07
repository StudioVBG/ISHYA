"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Mail,
  ArrowRight,
  Loader2,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { PinterestIcon, TikTokIcon } from "@/components/icons/social";
import type { SocialLinks } from "@/lib/queries/storefront";

const FOOTER_LINKS = {
  boutique: {
    title: "Boutique",
    links: [
      { label: "Tous les bijoux", href: "/boutique" },
      { label: "Nouveautés", href: "/boutique?badge=nouveau" },
      { label: "Best-sellers", href: "/boutique?badge=best-seller" },
      { label: "Promotions", href: "/boutique?badge=promo" },
      { label: "Packs & parures", href: "/boutique?type=pack" },
      { label: "Idées cadeaux", href: "/boutique?max=30" },
    ],
  },
  informations: {
    title: "La marque",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Notre atelier", href: "/atelier" },
      { label: "Savoir-faire", href: "/atelier" },
      { label: "Matériaux", href: "/materiaux" },
      { label: "Sur-mesure", href: "/sur-mesure" },
      { label: "Blog", href: "/blog" },
    ],
  },
  aide: {
    title: "Aide",
    links: [
      { label: "FAQ", href: "/aide" },
      { label: "Contact", href: "/contact" },
      { label: "Livraison", href: "/livraison" },
      { label: "Retours & échanges", href: "/retours" },
      { label: "Garantie", href: "/garantie" },
      { label: "Entretien", href: "/entretien" },
      { label: "Guide des tailles", href: "/guide-des-tailles" },
      { label: "CGV", href: "/cgv" },
    ],
  },
  compte: {
    title: "Mon compte",
    links: [
      { label: "Connexion", href: "/connexion" },
      { label: "Mes commandes", href: "/compte/commandes" },
      { label: "Mes favoris", href: "/compte/favoris" },
      { label: "Fidélité", href: "/programme-fidelite" },
      { label: "Parrainage", href: "/parrainage" },
      { label: "Carte cadeau", href: "/carte-cadeau" },
    ],
  },
};

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Cookies", href: "/cookies" },
  { label: "Médiation", href: "/mediation" },
  { label: "Accessibilité", href: "/accessibilite" },
];

export function Footer({ social }: { social: SocialLinks }) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const socialItems: Array<{
    href: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [];
  if (social.instagramUrl)
    socialItems.push({
      href: social.instagramUrl,
      label: "Instagram",
      Icon: Instagram,
    });
  if (social.pinterestUrl)
    socialItems.push({
      href: social.pinterestUrl,
      label: "Pinterest",
      Icon: PinterestIcon,
    });
  if (social.facebookUrl)
    socialItems.push({
      href: social.facebookUrl,
      label: "Facebook",
      Icon: Facebook,
    });
  if (social.tiktokUrl)
    socialItems.push({
      href: social.tiktokUrl,
      label: "TikTok",
      Icon: TikTokIcon,
    });
  if (social.youtubeUrl)
    socialItems.push({
      href: social.youtubeUrl,
      label: "YouTube",
      Icon: Youtube,
    });

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const res = await subscribeNewsletter({ email: trimmed, source: "footer" });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message);
      setEmail("");
    });
  }

  return (
    <footer className="bg-black text-ivory mt-auto">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container py-12 lg:py-16 text-center max-w-xl mx-auto">
          <h3 className="font-display text-xl sm:text-2xl mb-2">
            Recevez -10% sur votre première commande
          </h3>
          <p className="text-sm text-white/60 mb-6">
            Inscrivez-vous à notre newsletter pour recevoir en exclusivité nos
            nouveautés et offres spéciales.
          </p>
          <form
            onSubmit={handleNewsletter}
            className="flex gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-terracotta transition-colors"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  S&apos;inscrire
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Links grid */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h4 className="font-display text-sm font-semibold tracking-wider uppercase mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-terracotta transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Legal mini-bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/50">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-terracotta transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-white/40">
            <span>&copy; {new Date().getFullYear()} ISHYA - Création Florales</span>
            <span className="hidden sm:inline">|</span>
            <span>Bijoux artisanaux en fleurs séchées et résine</span>
          </div>

          {/* Payment icons placeholder + social */}
          <div className="flex items-center gap-6">
            {/* Payment icons */}
            <div className="flex items-center gap-2 text-white/40">
              <span className="text-xs border border-white/20 rounded px-1.5 py-0.5">
                CB
              </span>
              <span className="text-xs border border-white/20 rounded px-1.5 py-0.5">
                Visa
              </span>
              <span className="text-xs border border-white/20 rounded px-1.5 py-0.5">
                MC
              </span>
              <span className="text-xs border border-white/20 rounded px-1.5 py-0.5">
                PayPal
              </span>
            </div>

            {/* Social */}
            {(socialItems.length > 0 || social.contactEmail) && (
              <div className="flex items-center gap-3">
                {socialItems.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-terracotta transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
                {social.contactEmail && (
                  <a
                    href={`mailto:${social.contactEmail}`}
                    className="text-white/60 hover:text-terracotta transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
