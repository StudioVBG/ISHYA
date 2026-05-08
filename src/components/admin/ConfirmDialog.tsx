"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "destructive";
  pending?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "default",
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, pending, onOpenChange]);

  useEffect(() => {
    if (open) {
      const previous = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => confirmRef.current?.focus(), 50);
      return () => {
        clearTimeout(t);
        previous?.focus?.();
      };
    }
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => !pending && onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby={description ? "confirm-dialog-desc" : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-xl max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-3">
                {tone === "destructive" && (
                  <div className="shrink-0 w-10 h-10 rounded-full bg-destructive-soft flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    id="confirm-dialog-title"
                    className="text-base font-semibold text-foreground"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p
                      id="confirm-dialog-desc"
                      className="text-sm text-steel mt-1.5"
                    >
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-bone-soft/40 rounded-b-xl">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={pending}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-white transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50",
                  tone === "destructive"
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-ember hover:bg-ember-deep",
                )}
              >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
