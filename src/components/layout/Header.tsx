"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { slideInLeft, fadeIn, drawerTransition } from "@/lib/animations";
import { useCartStore } from "@/stores/cart-store";
import { SearchModal } from "./SearchModal";

const NAV_LINKS = [
  { label: "Colliers", href: "/boutique/colliers" },
  { label: "Bagues", href: "/boutique/bagues" },
  { label: "Bracelets", href: "/boutique/bracelets" },
  { label: "Boucles d'oreilles", href: "/boutique/boucles-doreilles" },
  { label: "Accessoires", href: "/boutique/accessoires" },
  { label: "Packs", href: "/boutique/packs" },
];

const ANNOUNCEMENT_COOKIE = "ishya-announcement-dismissed";

export function Header() {
  const pathname = usePathname();
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    const dismissed = document.cookie.includes(ANNOUNCEMENT_COOKIE);
    if (dismissed) setShowAnnouncement(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  function dismissAnnouncement() {
    setShowAnnouncement(false);
    document.cookie = `${ANNOUNCEMENT_COOKIE}=1;path=/;max-age=${60 * 60 * 24 * 7}`;
  }

  return (
    <>
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gold text-white overflow-hidden"
          >
            <div className="container flex items-center justify-center gap-2 py-2 text-xs sm:text-sm relative">
              <span>
                Livraison offerte dès 60€ | Retours gratuits 14 jours
              </span>
              <button
                onClick={dismissAnnouncement}
                className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
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
          "sticky top-0 z-50 bg-white transition-shadow duration-300",
          scrolled && "shadow-sm"
        )}
      >
        <div className="container flex items-center justify-between h-16 lg:h-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 hover:text-terracotta transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="font-display text-2xl lg:text-3xl tracking-wider font-semibold">
              ISHYA
            </span>
            <span className="text-[10px] lg:text-xs tracking-[0.25em] text-muted uppercase">
              Création Florales
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm tracking-wide hover:text-terracotta transition-colors relative py-1",
                  pathname?.startsWith(link.href) &&
                    "text-terracotta after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-terracotta"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:text-terracotta transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/compte"
              className="hidden sm:block p-2 hover:text-terracotta transition-colors"
              aria-label="Mon compte"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/compte/favoris"
              className="hidden sm:block p-2 hover:text-terracotta transition-colors"
              aria-label="Mes favoris"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <button
              onClick={openCart}
              className="p-2 hover:text-terracotta transition-colors relative"
              aria-label="Mon panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-white text-[10px] font-medium w-4.5 h-4.5 flex items-center justify-center rounded-full">
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
              className="fixed inset-y-0 left-0 z-50 w-[300px] bg-white shadow-xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-display text-xl tracking-wider font-semibold">
                  ISHYA
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:text-terracotta transition-colors"
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
                      pathname?.startsWith(link.href) && "text-terracotta font-medium"
                    )}
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </Link>
                ))}
              </nav>

              <div className="border-t border-border p-4 space-y-3">
                <Link
                  href="/compte"
                  className="flex items-center gap-3 px-2 py-2 text-sm hover:text-terracotta transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mon compte
                </Link>
                <Link
                  href="/compte/favoris"
                  className="flex items-center gap-3 px-2 py-2 text-sm hover:text-terracotta transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Mes favoris
                </Link>
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
