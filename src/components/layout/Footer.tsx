"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const FOOTER_LINKS = {
  boutique: {
    title: "Boutique",
    links: [
      { label: "Colliers", href: "/boutique/colliers" },
      { label: "Bagues", href: "/boutique/bagues" },
      { label: "Bracelets", href: "/boutique/bracelets" },
      { label: "Boucles d'oreilles", href: "/boutique/boucles-doreilles" },
      { label: "Accessoires", href: "/boutique/accessoires" },
      { label: "Packs", href: "/boutique/packs" },
    ],
  },
  informations: {
    title: "Informations",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Blog", href: "/blog" },
      { label: "Guide des tailles", href: "/guide-des-tailles" },
    ],
  },
  aide: {
    title: "Aide",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Livraison", href: "/livraison" },
      { label: "Retours & échanges", href: "/retours" },
      { label: "CGV", href: "/cgv" },
    ],
  },
  compte: {
    title: "Mon Compte",
    links: [
      { label: "Connexion", href: "/connexion" },
      { label: "Mes commandes", href: "/compte/commandes" },
      { label: "Mes favoris", href: "/compte/favoris" },
      { label: "Fidélité", href: "/compte/fidelite" },
    ],
  },
};

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Merci ! Vérifiez votre boîte mail pour votre code -10%.");
    setEmail("");
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
              className="px-6 py-3 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors flex items-center gap-2"
            >
              S&apos;inscrire
              <ArrowRight className="w-4 h-4" />
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

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-white/40">
            <span>&copy; 2026 ISHYA - Création Florales</span>
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
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-terracotta transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-terracotta transition-colors"
                aria-label="Pinterest"
              >
                <PinterestIcon className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-terracotta transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@ishya.fr"
                className="text-white/60 hover:text-terracotta transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
