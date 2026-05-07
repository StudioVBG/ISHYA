"use client";

import { History, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DraftRestoreBannerProps {
  /** Timestamp ms du brouillon localStorage à restaurer. */
  savedAt: number;
  /** Affiche le bandeau si vrai. Pré-calculé par le parent. */
  show: boolean;
  onRestore: () => void;
  onDismiss: () => void;
}

const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Bandeau "Brouillon non sauvegardé enregistré à HH:MM — Restaurer / Ignorer".
 *
 * Ne s'auto-restaure JAMAIS pour éviter de surprendre l'admin.
 */
export function DraftRestoreBanner({
  savedAt,
  show,
  onRestore,
  onDismiss,
}: DraftRestoreBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-info-soft border border-info/30 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3"
          role="status"
          aria-live="polite"
        >
          <History className="w-4 h-4 text-info flex-shrink-0" />
          <p className="text-sm text-foreground flex-1 min-w-0">
            <strong>Brouillon non sauvegardé</strong>{" "}
            <span className="text-muted">
              · enregistré à {TIME_FORMATTER.format(new Date(savedAt))}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRestore}
              className="px-3 py-1.5 text-xs font-medium bg-info text-white rounded-md hover:bg-info/90 transition-colors"
            >
              Restaurer
            </button>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Ignorer le brouillon"
              className="p-1.5 text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

