"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  MapPin,
  Package,
  Heart,
  Star,
  CreditCard,
  Bell,
  Gift,
  RotateCcw,
  Headphones,
  Ruler,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Header, type HeaderAccount } from "@/components/layout/Header";
import { Footer, type FooterSocialLinks } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

const accountNav = [
  { href: "/compte", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/compte/profil", label: "Profil", icon: User },
  { href: "/compte/adresses", label: "Adresses", icon: MapPin },
  { href: "/compte/commandes", label: "Commandes", icon: Package },
  { href: "/compte/favoris", label: "Favoris", icon: Heart },
  { href: "/compte/avis", label: "Avis", icon: Star },
  { href: "/compte/paiement", label: "Moyens de paiement", icon: CreditCard },
  { href: "/compte/notifications", label: "Notifications", icon: Bell },
  { href: "/compte/fidelite", label: "Fidélité", icon: Gift },
  { href: "/compte/retours", label: "Retours", icon: RotateCcw },
  { href: "/compte/tickets", label: "Aide & messages", icon: Headphones },
  { href: "/compte/tailles", label: "Mes tailles", icon: Ruler },
];

const labelMap: Record<string, string> = {
  compte: "Mon compte",
  profil: "Profil",
  adresses: "Adresses",
  commandes: "Commandes",
  favoris: "Favoris",
  avis: "Avis",
  paiement: "Moyens de paiement",
  notifications: "Notifications",
  fidelite: "Fidélité",
  retours: "Retours",
  tickets: "Aide & messages",
  tailles: "Mes tailles",
  suivi: "Suivi",
  nouveau: "Nouveau",
};

function getBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "Accueil", href: "/" },
  ];

  let href = "";
  for (const segment of segments) {
    href += `/${segment}`;
    const label = labelMap[segment] || segment;
    crumbs.push({ label, href });
  }

  return crumbs;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CompteShell({
  firstName,
  lastName,
  loyaltyTier,
  account,
  social,
  children,
}: {
  firstName: string | null;
  lastName: string | null;
  loyaltyTier: string;
  account: HeaderAccount;
  social?: FooterSocialLinks;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getBreadcrumb(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const currentPage = accountNav.find((item) =>
    isActive(item.href, item.exact),
  );

  const initial = (firstName ?? lastName ?? "U")[0].toUpperCase();
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "Mon compte";
  const tierLabel = `Membre ${capitalize(loyaltyTier)}`;

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Impossible de vous déconnecter. Réessayez.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Header account={account} />
      <CartDrawer />
      <main className="flex-1 bg-background">
        <div className="border-b border-border bg-white/50">
          <div className="container py-3">
            <nav className="flex items-center gap-1.5 text-xs text-muted">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3 h-3" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-foreground font-medium">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-terracotta transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>

        <div className="container py-8 lg:py-12">
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              {currentPage?.label || "Menu"}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-hidden mb-6"
              >
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {accountNav.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                          active
                            ? "bg-terracotta text-white"
                            : "bg-white text-foreground border border-border hover:border-terracotta hover:text-terracotta",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-6 lg:gap-10 xl:gap-12">
            <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                  <div className="w-12 h-12 rounded-full bg-beige-nude flex items-center justify-center">
                    <span className="text-lg font-display font-semibold text-terracotta">
                      {initial}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{fullName}</p>
                    <p className="text-xs text-muted">{tierLabel}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {accountNav.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                          active
                            ? "bg-terracotta/10 text-terracotta"
                            : "text-muted hover:text-foreground hover:bg-beige-nude-light/50",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-[18px] h-[18px] transition-colors",
                            active
                              ? "text-terracotta"
                              : "text-muted-light group-hover:text-foreground",
                          )}
                        />
                        {item.label}
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-terracotta" />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-6 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-destructive transition-colors w-full"
                  >
                    <LogOut className="w-[18px] h-[18px]" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </aside>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
              className="flex-1 min-w-0"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer social={social} />
    </>
  );
}
