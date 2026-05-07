"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ShoppingCart, RotateCcw, Headphones, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  counts: {
    pendingOrders: number;
    pendingReturns: number;
    openTickets: number;
    unmoderatedReviews: number;
    total: number;
  };
}

export function NotificationBell({ counts }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const hasAlerts = counts.total > 0;

  const items = [
    {
      label: "Commandes en attente",
      count: counts.pendingOrders,
      href: "/admin/commandes?status=pending",
      icon: ShoppingCart,
    },
    {
      label: "Retours à traiter",
      count: counts.pendingReturns,
      href: "/admin/retours",
      icon: RotateCcw,
    },
    {
      label: "Tickets ouverts",
      count: counts.openTickets,
      href: "/admin/tickets",
      icon: Headphones,
    },
    {
      label: "Avis à modérer",
      count: counts.unmoderatedReviews,
      href: "/admin/avis",
      icon: Star,
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          hasAlerts
            ? `${counts.total} notification${counts.total > 1 ? "s" : ""}`
            : "Aucune notification"
        }
        aria-expanded={open}
        className="relative p-2 rounded-lg hover:bg-muted-soft transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {hasAlerts && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-terracotta text-white text-[10px] font-semibold flex items-center justify-center">
            {counts.total > 99 ? "99+" : counts.total}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {hasAlerts
                    ? `${counts.total} action${counts.total > 1 ? "s" : ""} en attente`
                    : "Tout est à jour"}
                </p>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = item.count > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted-soft transition-colors",
                        !active && "opacity-60",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted" />
                        <span className="text-sm text-foreground">
                          {item.label}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          active
                            ? "bg-terracotta/10 text-terracotta"
                            : "bg-muted-soft text-muted",
                        )}
                      >
                        {item.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
