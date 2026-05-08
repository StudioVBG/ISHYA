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
      { label: "Notre équipe", href: "/equipe" },
      { label: "Matériaux", href: "/materiaux" },
      { label: "Sur-mesure", href: "/sur-mesure" },
      { label: "Blog", href: "/blog" },
      { label: "Presse", href: "/presse" },
      { label: "Recrutement", href: "/recrutement" },
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
    <footer className="bg-ink text-bone mt-auto">
      {/* ── Manifeste + Newsletter (asymétrique 5/7) ──────────── */}
      <div className="border-b border-bone/10">
        <div className="container py-20 lg:py-28">
          <div className="grid grid-cols-12 gap-y-12 lg:gap-x-16">
            {/* Manifeste */}
            <div className="col-span-12 lg:col-span-5">
              <div className="flex items-center gap-3 mb-8">
                <span className="h-px w-10 bg-ember" aria-hidden />
                <span className="eyebrow text-bone/60">
                  Maison · Édition 2026
                </span>
              </div>
              <h3
                className="font-display text-bone text-4xl md:text-5xl lg:text-[3.6rem] leading-[1.04] tracking-[-0.03em] mb-6"
                style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'WONK' 0", fontWeight: 380 }}
              >
                Des bijoux qui gardent <em className="font-display italic text-ember" style={{ fontStyle: "italic" }}>la trace du geste.</em>
              </h3>
              <p className="text-bone/65 leading-relaxed max-w-md">
                Inscrivez-vous au journal de l&apos;atelier — éditions saisonnières, pièces uniques avant tout le monde et –10 % sur votre première commande.
              </p>
            </div>

            {/* Newsletter */}
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:self-end">
              <form onSubmit={handleNewsletter} className="space-y-4">
                <label
                  htmlFor="newsletter-email"
                  className="block font-mono text-[10px] tracking-[0.24em] uppercase text-bone/50"
                >
                  Adresse email
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@maison.fr"
                    required
                    className="flex-1 px-0 py-3 bg-transparent border-0 border-b border-bone/30 text-bone placeholder:text-bone/30 focus:outline-none focus:border-ember transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="self-start sm:self-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-ember text-bone hover:bg-ember-bright transition-colors disabled:opacity-60 font-mono text-[11px] tracking-[0.16em] uppercase"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Rejoindre
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[10px] tracking-wide text-bone/40">
                  En vous inscrivant, vous acceptez notre{" "}
                  <Link href="/confidentialite" className="underline-offset-4 hover:text-bone hover:underline">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Liens (4 colonnes mono) ────────────────────────────── */}
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h4 className="font-mono text-[10px] tracking-[0.24em] uppercase text-bone/50 mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-bone/75 hover:text-ember transition-colors"
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

      {/* ── Wordmark plein écran (signature éditoriale) ────────── */}
      <div className="border-t border-bone/10 overflow-hidden">
        <div className="container py-12 lg:py-16 flex items-end justify-between gap-8">
          <span
            className="font-display text-bone leading-none"
            style={{
              fontSize: "clamp(4rem, 16vw, 14rem)",
              fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 1",
              fontWeight: 380,
              letterSpacing: "-0.04em",
            }}
            aria-hidden
          >
            ISHYA
          </span>
          <span className="hidden sm:block font-mono text-[10px] tracking-[0.24em] uppercase text-bone/40 pb-3 text-right">
            Atelier Paris
            <br />
            FR · 2026
          </span>
        </div>
      </div>

      {/* ── Mentions légales mini-bar ──────────────────────────── */}
      <div className="border-t border-bone/10">
        <div className="container py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.16em] uppercase text-bone/40">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-bone transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom bar : copyright + paiements + social ────────── */}
      <div className="border-t border-bone/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-mono text-[10px] tracking-[0.12em] uppercase text-bone/40">
            <span>&copy; {new Date().getFullYear()} ISHYA</span>
            <span className="hidden sm:inline opacity-50">·</span>
            <span>Bijoux artisanaux · fleurs séchées &amp; résine</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-bone/40">
              {["CB", "Visa", "MC", "PayPal", "Apple Pay"].map((label) => (
                <span
                  key={label}
                  className="font-mono text-[9px] tracking-wider border border-bone/20 px-1.5 py-0.5"
                >
                  {label}
                </span>
              ))}
            </div>

            {(socialItems.length > 0 || social.contactEmail) && (
              <div className="flex items-center gap-3">
                {socialItems.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bone/60 hover:text-ember transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
                {social.contactEmail && (
                  <a
                    href={`mailto:${social.contactEmail}`}
                    className="text-bone/60 hover:text-ember transition-colors"
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
