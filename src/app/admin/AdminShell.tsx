"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Gift,
  ShoppingCart,
  Users,
  Warehouse,
  Percent,
  RotateCcw,
  Headphones,
  HelpCircle,
  Star,
  FileText,
  LayoutTemplate,
  Image as ImageIcon,
  Search,
  BarChart3,
  Settings,
  UserCog,
  Shield,
  Menu,
  ExternalLink,
  LogOut,
  Mail,
  Send,
  Ticket,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminSignOut } from "./actions";
import { NotificationBell } from "./NotificationBell";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Produits", href: "/admin/produits", icon: Package },
      { label: "Catégories", href: "/admin/categories", icon: FolderTree },
      { label: "Collections", href: "/admin/collections", icon: Layers },
      { label: "Packs", href: "/admin/packs", icon: Gift },
    ],
  },
  {
    label: "Ventes",
    items: [
      { label: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
      { label: "Clients", href: "/admin/clients", icon: Users },
      { label: "Stocks", href: "/admin/stocks", icon: Warehouse },
      { label: "Promotions", href: "/admin/promotions", icon: Percent },
      { label: "Cartes cadeaux", href: "/admin/cartes-cadeaux", icon: Ticket },
      {
        label: "Paniers abandonnés",
        href: "/admin/paniers-abandonnes",
        icon: ShoppingBag,
      },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Retours", href: "/admin/retours", icon: RotateCcw },
      { label: "Tickets", href: "/admin/tickets", icon: Headphones },
      { label: "Messages", href: "/admin/messages", icon: Mail },
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { label: "Avis", href: "/admin/avis", icon: Star },
    ],
  },
  {
    label: "Contenu",
    items: [
      { label: "Blog", href: "/admin/blog", icon: FileText },
      { label: "Pages", href: "/admin/pages", icon: LayoutTemplate },
      { label: "Bannières", href: "/admin/bannieres", icon: ImageIcon },
      { label: "Newsletter", href: "/admin/newsletter", icon: Send },
      { label: "SEO", href: "/admin/seo", icon: Search },
    ],
  },
  {
    label: "Analyse",
    items: [
      { label: "Rapports", href: "/admin/rapports", icon: BarChart3 },
    ],
  },
  {
    label: "Système",
    items: [
      { label: "Paramètres", href: "/admin/parametres", icon: Settings },
      { label: "Livraison", href: "/admin/livraison", icon: Truck },
      { label: "Équipe", href: "/admin/equipe", icon: UserCog },
      { label: "Audit", href: "/admin/audit", icon: Shield },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/produits": "Produits",
  "/admin/produits/nouveau": "Nouveau produit",
  "/admin/categories": "Catégories",
  "/admin/collections": "Collections",
  "/admin/packs": "Packs",
  "/admin/commandes": "Commandes",
  "/admin/clients": "Clients",
  "/admin/stocks": "Stocks",
  "/admin/promotions": "Promotions",
  "/admin/cartes-cadeaux": "Cartes cadeaux",
  "/admin/paniers-abandonnes": "Paniers abandonnés",
  "/admin/retours": "Retours",
  "/admin/tickets": "Tickets",
  "/admin/messages": "Messages",
  "/admin/faq": "FAQ",
  "/admin/avis": "Avis clients",
  "/admin/blog": "Blog",
  "/admin/pages": "Pages",
  "/admin/bannieres": "Bannières",
  "/admin/newsletter": "Newsletter",
  "/admin/seo": "SEO",
  "/admin/rapports": "Rapports",
  "/admin/parametres": "Paramètres",
  "/admin/livraison": "Livraison",
  "/admin/equipe": "Équipe",
  "/admin/audit": "Journal d'audit",
};

interface AdminShellProps {
  user: {
    displayName: string;
    initials: string;
    avatarUrl: string | null;
  };
  notificationCounts: {
    pendingOrders: number;
    pendingReturns: number;
    openTickets: number;
    unmoderatedReviews: number;
    total: number;
  };
  children: React.ReactNode;
}

export function AdminShell({ user, notificationCounts, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const pageTitle =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ||
    "Administration";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <span
            className="text-xl font-bold tracking-wide text-white"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            ISHYA
          </span>
          <span className="text-xs font-medium text-muted uppercase tracking-widest">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-terracotta/20 text-terracotta-light"
                        : "text-muted hover:bg-foreground hover:text-muted-light",
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:bg-foreground hover:text-muted-light transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Voir la boutique
        </Link>
        <form action={adminSignOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:bg-foreground hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-ivory">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-foreground border-r border-border shrink-0">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-foreground z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted-soft transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell counts={notificationCounts} />
            <Link
              href="/compte/profil"
              className="hidden sm:flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
              title="Modifier mon profil"
            >
              <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm font-semibold text-terracotta">
                    {user.initials}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {user.displayName}
                </p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-terracotta/10 text-terracotta">
                  Admin
                </span>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
