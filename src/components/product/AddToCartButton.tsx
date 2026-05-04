"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOutQuart } from "@/lib/animations";

interface AddToCartButtonProps {
  onAdd: () => void | Promise<void>;
  disabled?: boolean;
  outOfStock?: boolean;
  label?: string;
  className?: string;
}

export function AddToCartButton({
  onAdd,
  disabled,
  outOfStock,
  label = "Ajouter au panier",
  className,
}: AddToCartButtonProps) {
  const [state, setState] = useState<"idle" | "filling" | "done">("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const flyHeart = () => {
    if (!buttonRef.current) return;
    const cartIcon = document.querySelector<HTMLElement>("[data-cart-icon]");
    if (!cartIcon) return;
    const start = buttonRef.current.getBoundingClientRect();
    const end = cartIcon.getBoundingClientRect();

    const dot = document.createElement("div");
    dot.style.cssText = `
      position: fixed;
      left: ${start.left + start.width / 2}px;
      top: ${start.top + start.height / 2}px;
      width: 14px;
      height: 14px;
      border-radius: 9999px;
      background: var(--terracotta);
      box-shadow: 0 4px 14px rgba(223,136,123,0.45);
      z-index: 99999;
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease;
    `;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      const dx = end.left + end.width / 2 - (start.left + start.width / 2);
      const dy = end.top + end.height / 2 - (start.top + start.height / 2);
      dot.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.4)`;
      dot.style.opacity = "0";
    });
    setTimeout(() => dot.remove(), 800);
  };

  const handleClick = async () => {
    if (disabled || outOfStock || state !== "idle") return;
    setState("filling");
    flyHeart();
    await Promise.resolve(onAdd());
    setTimeout(() => setState("done"), 500);
    setTimeout(() => setState("idle"), 1600);
  };

  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "relative h-12 px-6 rounded-md bg-foreground/10 text-foreground/50 font-medium text-sm flex-1 cursor-not-allowed",
          className
        )}
      >
        Rupture de stock
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      disabled={disabled || state !== "idle"}
      className={cn(
        "relative overflow-hidden h-12 px-6 rounded-md bg-terracotta text-white font-medium text-sm flex-1 group",
        "disabled:opacity-90",
        className
      )}
    >
      {/* Fill progressif */}
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={{ scaleX: state === "filling" || state === "done" ? 1 : 0 }}
        transition={{ duration: 0.5, ease: easeOutQuart }}
        style={{ originX: 0 }}
        className="absolute inset-0 bg-terracotta-dark"
      />
      {/* Hover overlay (subtil) */}
      <span className="absolute inset-0 bg-terracotta-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <span className="relative flex items-center justify-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {state === "done" ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: easeOutQuart }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Ajouté au panier
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: easeOutQuart }}
              className="flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
