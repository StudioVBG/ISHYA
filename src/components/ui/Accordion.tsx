"use client";

import { useState, useId, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id?: string;
  title: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Permet d'ouvrir plusieurs panneaux à la fois. Défaut : false. */
  multiple?: boolean;
  /** Indices ouverts par défaut. */
  defaultOpen?: number[];
  className?: string;
}

export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<number[]>(defaultOpen);
  const baseId = useId();

  function toggle(i: number) {
    setOpenIndices((prev) => {
      const isOpen = prev.includes(i);
      if (multiple) {
        return isOpen ? prev.filter((x) => x !== i) : [...prev, i];
      }
      return isOpen ? [] : [i];
    });
  }

  return (
    <div className={cn("divide-y divide-border", className)}>
      {items.map((item, i) => {
        const isOpen = openIndices.includes(i);
        const headerId = `${baseId}-h-${i}`;
        const panelId = `${baseId}-p-${i}`;
        return (
          <div key={item.id ?? i}>
            <button
              type="button"
              id={headerId}
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground hover:text-terracotta transition-colors"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 shrink-0 text-muted transition-transform",
                  isOpen && "rotate-180 text-terracotta",
                )}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-sm text-muted leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
