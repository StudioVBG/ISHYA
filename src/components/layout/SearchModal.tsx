"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp } from "lucide-react";
import { fadeIn } from "@/lib/animations";

const TRENDING = [
  { label: "Colliers", href: "/boutique/colliers" },
  { label: "Bagues florales", href: "/boutique/bagues" },
  { label: "Parures", href: "/boutique/packs" },
  { label: "Nouveautés", href: "/boutique?tri=nouveautes" },
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      queueMicrotask(() => setQuery(""));
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/boutique?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-md flex flex-col items-center justify-start pt-[15vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:text-terracotta transition-colors"
            aria-label="Fermer la recherche"
          >
            <X className="w-6 h-6" />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-full max-w-2xl px-6"
          >
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un bijou..."
                className="w-full pl-10 pr-4 py-4 bg-transparent border-b-2 border-border focus:border-terracotta outline-none font-display text-xl sm:text-2xl placeholder:text-muted-light transition-colors"
              />
            </form>

            <div className="mt-10">
              <div className="flex items-center gap-2 text-sm text-muted mb-4">
                <TrendingUp className="w-4 h-4" />
                <span>Tendances</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {TRENDING.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="px-4 py-2 bg-beige-nude-light rounded-full text-sm hover:bg-beige-nude transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
