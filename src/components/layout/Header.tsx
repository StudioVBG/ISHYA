"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  Shield,
  Instagram,
  Facebook,
  Youtube,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { slideInLeft, fadeIn, drawerTransition } from "@/lib/animations";
import { useCartStore } from "@/stores/cart-store";
import { SearchModal } from "./SearchModal";
import { PinterestIcon, TikTokIcon } from "@/components/icons/social";
import type { SocialLinks } from "@/lib/queries/storefront";

const NAV_LINKS = [
  { label: "Colliers", href: "/boutique?categorie=colliers" },
  { label: "Bagues", href: "/boutique?categorie=bagues" },
  { label: "Bracelets", href: "/boutique?categorie=bracelets" },
  {
    label: "Boucles d'oreilles",
    href: "/boutique?categorie=boucles-d-oreilles",
  },
  { label: "Accessoires", href: "/boutique?categorie=accessoires" },
  { label: "Packs", href: "/boutique?type=pack" },
  { label: "Promos", href: "/boutique?badge=promo" },
];

const ANNOUNCEMENT_COOKIE_PREFIX = "ishya-announcement-dismissed-";

export interface HeaderAccount {
  href: string;
  label: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export interface HeaderAnnouncement {
  id: string;
  title: string;
  subtitle: string | null;
  linkUrl: string | null;
}

const DEFAULT_ACCOUNT: HeaderAccount = {
  href: "/connexion",
  label: "Se connecter",
  isAdmin: false,
  isAuthenticated: false,
};

const DEFAULT_ANNOUNCEMENT: HeaderAnnouncement = {
  id: "default",
  title: "Livraison offerte dès 60€ | Retours gratuits 14 jours",
  subtitle: null,
  linkUrl: null,
};

export function Header({
  account = DEFAULT_ACCOUNT,
  announcement,
  social,
}: {
  account?: HeaderAccount;
  announcement?: HeaderAnnouncement | null;
  social?: SocialLinks;
} = {}) {
  const banner = announcement === undefined ? DEFAULT_ANNOUNCEMENT : announcement;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = (href: string) => {
    if (href.includes("?")) {
      const [hPath, hQs] = href.split("?");
      if (pathname !== hPath) return false;
      const want = new URLSearchParams(hQs);
      for (const [k, v] of want.entries()) {
        if (searchParams?.get(k) !== v) return false;
      }
      return true;
    }
    return pathname?.startsWith(href) ?? false;
  };
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    if (
      banner &&
      document.cookie.includes(`${ANNOUNCEMENT_COOKIE_PREFIX}${banner.id}=`)
    ) {
      queueMicrotask(() => setShowAnnouncement(false));
    }
  }, [banner]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      queueMicrotask(() => setMobileMenuOpen(false));
    }
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  function dismissAnnouncement() {
    setShowAnnouncement(false);
    if (banner) {
      document.cookie = `${ANNOUNCEMENT_COOKIE_PREFIX}${banner.id}=1;path=/;max-age=${60 * 60 * 24 * 7}`;
    }
  }

  return (
    <>
      <AnimatePresence>
        {banner && showAnnouncement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-ink text-bone overflow-hidden"
          >
            <div className="container flex items-center justify-center gap-2 py-2.5 relative">
              {banner.linkUrl ? (
                <Link
                  href={banner.linkUrl}
                  className="font-mono text-[11px] tracking-[0.18em] uppercase hover:text-ember transition-colors"
                >
                  {banner.title}
                </Link>
              ) : (
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                  {banner.title}
                </span>
              )}
              <button
                onClick={dismissAnnouncement}
                className="absolute right-4 p-1 hover:text-ember transition-colors"
                aria-label="Fermer l'annonce"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300 border-b",
          scrolled
            ? "bg-bone/85 backdrop-blur-xl border-border"
            : "bg-bone border-transparent",
        )}
      >
        <div className="container flex items-center justify-between h-16 lg:h-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2.5 -ml-2 min-w-11 min-h-11 flex items-center justify-center text-ink hover:text-ember transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Wordmark — Fraunces WONK signature */}
          <Link href="/" className="flex flex-col items-center leading-[0.95] group">
            <span
              className="font-display text-ink text-2xl lg:text-[1.875rem]"
              style={{
                fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'WONK' 1",
                fontWeight: 420,
                letterSpacing: "-0.02em",
              }}
            >
              ISHYA
            </span>
            <span className="font-mono text-[9px] lg:text-[10px] tracking-[0.32em] text-steel uppercase mt-0.5">
              Maison · Paris
            </span>
          </Link>

          {/* Desktop nav — mono uppercase */}
          <nav
            className="hidden lg:flex items-center gap-7"
            aria-label="Navigation principale"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-mono text-[11px] tracking-[0.16em] uppercase text-ink/80 hover:text-ink transition-colors relative py-1",
                  "after:absolute after:bottom-0 after:left-0 after:h-px after:bg-ink after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.30,1)] after:origin-left",
                  isActive(link.href)
                    ? "text-ink after:w-full after:scale-x-100"
                    : "after:w-full after:scale-x-0 hover:after:scale-x-100",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 min-w-11 min-h-11 flex items-center justify-center text-ink hover:text-ember transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href={account.href}
              className="hidden sm:flex p-2.5 min-w-11 min-h-11 items-center justify-center text-ink hover:text-ember transition-colors relative"
              aria-label={account.label}
              title={account.label}
            >
              {account.isAdmin ? (
                <Shield className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>

            {!account.isAdmin && (
              <Link
                href={
                  account.isAuthenticated
                    ? "/compte/favoris"
                    : "/connexion?redirect_to=/compte/favoris"
                }
                className="hidden sm:flex p-2.5 min-w-11 min-h-11 items-center justify-center text-ink hover:text-ember transition-colors"
                aria-label="Mes favoris"
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}

            <button
              onClick={openCart}
              data-cart-icon
              className="p-2.5 min-w-11 min-h-11 flex items-center justify-center text-ink hover:text-ember transition-colors relative"
              aria-label="Mon panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-ember text-bone text-[10px] font-mono font-medium min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full tabular-nums">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={drawerTransition}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-white shadow-xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-display text-xl tracking-wider font-semibold">
                  ISHYA
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 min-w-11 min-h-11 flex items-center justify-center hover:text-terracotta transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4" aria-label="Menu mobile">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-6 py-3.5 text-sm tracking-wide hover:bg-beige-nude-light transition-colors",
                      isActive(link.href) && "text-terracotta font-medium"
                    )}
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </Link>
                ))}
              </nav>

              <div className="border-t border-border p-4 space-y-3">
                <Link
                  href={account.href}
                  className="flex items-center gap-3 px-2 py-2 text-sm hover:text-terracotta transition-colors"
                >
                  {account.isAdmin ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {account.isAdmin
                    ? "Tableau de bord admin"
                    : account.isAuthenticated
                      ? "Mon compte"
                      : "Se connecter"}
                </Link>
                {!account.isAdmin && (
                  <Link
                    href={
                      account.isAuthenticated
                        ? "/compte/favoris"
                        : "/connexion?redirect_to=/compte/favoris"
                    }
                    className="flex items-center gap-3 px-2 py-2 text-sm hover:text-terracotta transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Mes favoris
                  </Link>
                )}
                {social ? <MobileSocialRow social={social} /> : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileSocialRow({ social }: { social: SocialLinks }) {
  const items: Array<{
    href: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [];
  if (social.instagramUrl)
    items.push({ href: social.instagramUrl, label: "Instagram", Icon: Instagram });
  if (social.facebookUrl)
    items.push({ href: social.facebookUrl, label: "Facebook", Icon: Facebook });
  if (social.pinterestUrl)
    items.push({ href: social.pinterestUrl, label: "Pinterest", Icon: PinterestIcon });
  if (social.tiktokUrl)
    items.push({ href: social.tiktokUrl, label: "TikTok", Icon: TikTokIcon });
  if (social.youtubeUrl)
    items.push({ href: social.youtubeUrl, label: "YouTube", Icon: Youtube });

  if (items.length === 0 && !social.contactEmail) return null;

  return (
    <div className="pt-3 border-t border-border">
      <p className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted mb-2">
        Suivez-nous
      </p>
      <div className="flex items-center gap-2 px-2">
        {items.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-terracotta hover:border-terracotta/40 transition-colors"
          >
            <Icon className="w-4 h-4" />
          </a>
        ))}
        {social.contactEmail && (
          <a
            href={`mailto:${social.contactEmail}`}
            aria-label="Email"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-terracotta hover:border-terracotta/40 transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
