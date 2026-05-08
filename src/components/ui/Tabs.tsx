"use client";

import { useState, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveId?: string;
  className?: string;
  variant?: "underline" | "pill";
}

export function Tabs({
  items,
  defaultActiveId,
  className,
  variant = "underline",
}: TabsProps) {
  const [activeId, setActiveId] = useState<string>(
    defaultActiveId ?? items[0]?.id ?? "",
  );
  const baseId = useId();

  if (items.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        className={cn(
          "flex gap-1",
          variant === "underline" && "border-b border-border",
          variant === "pill" && "p-1 bg-muted-soft rounded-lg",
        )}
      >
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${baseId}-${item.id}`}
              id={`${baseId}-tab-${item.id}`}
              disabled={item.disabled}
              onClick={() => !item.disabled && setActiveId(item.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variant === "underline" && [
                  "-mb-px border-b-2",
                  isActive
                    ? "border-terracotta text-foreground"
                    : "border-transparent text-muted hover:text-foreground",
                ],
                variant === "pill" && [
                  "rounded-md",
                  isActive
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted hover:text-foreground",
                ],
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={activeId !== item.id}
          className="pt-6"
        >
          {activeId === item.id && item.content}
        </div>
      ))}
    </div>
  );
}
