"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/actions/newsletter";

const STORAGE_KEY = "ishya:newsletter_popup";
// Une fois fermé : on ne le réaffiche qu'au bout de 30 jours.
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// Une fois inscrit : on ne le réaffiche jamais (TTL effectivement infini).
const SUBSCRIBED_TTL_MS = 365 * 24 * 60 * 60 * 1000;
// Délai avant la première apparition (ms).
const SHOW_DELAY_MS = 12_000;

type StoredState = {
  state: "dismissed" | "subscribed";
  until: number;
};

function readState(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed || typeof parsed.until !== "number") return null;
    if (Date.now() > parsed.until) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeState(state: StoredState["state"]) {
  if (typeof window === "undefined") return;
  const ttl = state === "subscribed" ? SUBSCRIBED_TTL_MS : DISMISS_TTL_MS;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state, until: Date.now() + ttl }),
    );
  } catch {
    // Stockage indisponible (mode privé) : on ignore. Le popup pourra
    // réapparaître à la session suivante.
  }
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = readState();
    if (stored) return;

    let exitListener: ((e: MouseEvent) => void) | null = null;

    const timer = window.setTimeout(() => {
      if (readState()) return;
      setOpen(true);
    }, SHOW_DELAY_MS);

    // Exit-intent : si la souris quitte le viewport par le haut.
    exitListener = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      if (readState()) return;
      setOpen(true);
    };
    document.addEventListener("mouseleave", exitListener);

    return () => {
      window.clearTimeout(timer);
      if (exitListener) document.removeEventListener("mouseleave", exitListener);
    };
  }, []);

  function handleClose() {
    writeState("dismissed");
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const res = await subscribeNewsletter({
        email: trimmed,
        source: "popup",
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message);
      writeState("subscribed");
      setEmail("");
      setOpen(false);
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-popup-title"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted-soft text-muted z-10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-br from-terracotta/10 via-gold/10 to-beige-nude-light px-6 pt-12 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-terracotta text-white mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2
                id="newsletter-popup-title"
                className="font-display text-2xl mb-2"
              >
                -10% sur votre première commande
              </h2>
              <p className="text-sm text-muted">
                Inscrivez-vous à notre journal pour recevoir le code promo et
                l&apos;exclu sur nos nouveautés.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  disabled={isPending}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full gap-2 disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Recevoir mon code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="block w-full text-center text-xs text-muted hover:text-foreground transition-colors"
              >
                Non merci
              </button>
              <p className="text-[10px] text-muted-light text-center pt-1">
                En vous inscrivant, vous acceptez de recevoir nos emails. Vous
                pouvez vous désinscrire à tout moment.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
