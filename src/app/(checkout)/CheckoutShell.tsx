"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Panier", path: "/panier" },
  { label: "Identification", path: "/checkout/identification" },
  { label: "Livraison", path: "/checkout/livraison" },
  { label: "Paiement", path: "/checkout/paiement" },
] as const;

function getStepIndex(pathname: string): number {
  if (pathname.startsWith("/checkout/confirmation")) return 4;
  const idx = STEPS.findIndex((s) => pathname.startsWith(s.path));
  return idx === -1 ? 0 : idx;
}

export function CheckoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = getStepIndex(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4 flex justify-center">
          <Link
            href="/"
            className="font-display text-2xl tracking-widest text-foreground hover:text-terracotta transition-colors"
          >
            ISHYA
          </Link>
        </div>

        <nav className="container pb-4" aria-label="Étapes du checkout">
          <ol className="flex items-center justify-center gap-0 max-w-xl mx-auto">
            {STEPS.map((step, i) => {
              const isCompleted = i < current;
              const isCurrent = i === current;

              return (
                <li key={step.label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 relative">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isCompleted
                          ? "var(--terracotta)"
                          : isCurrent
                            ? "var(--terracotta)"
                            : "var(--beige-nude-light)",
                        scale: isCurrent ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                        isCompleted || isCurrent ? "text-white" : "text-muted"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        "text-[11px] font-medium whitespace-nowrap hidden sm:block",
                        isCurrent
                          ? "text-terracotta"
                          : isCompleted
                            ? "text-foreground"
                            : "text-muted"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-2 mt-[-12px] sm:mt-0 relative">
                      <div className="absolute inset-0 bg-border" />
                      <motion.div
                        initial={false}
                        animate={{ scaleX: isCompleted ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 bg-terracotta origin-left"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      <main className="flex-1">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="hover:text-terracotta transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-terracotta transition-colors">
              CGV
            </Link>
            <Link href="/confidentialite" className="hover:text-terracotta transition-colors">
              Confidentialité
            </Link>
          </div>
          <p>© {new Date().getFullYear()} ISHYA — Paiement 100% sécurisé</p>
        </div>
      </footer>
    </div>
  );
}
