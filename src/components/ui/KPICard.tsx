"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerItem } from "@/lib/animations";

export type KPIVariant =
  | "brand"
  | "gold"
  | "info"
  | "success"
  | "warning"
  | "accent"
  | "neutral";

interface KPICardProps {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  variant?: KPIVariant;
  href?: string;
  className?: string;
}

const variantClasses: Record<KPIVariant, string> = {
  brand: "bg-terracotta/10 text-terracotta-dark",
  gold: "bg-gold/10 text-gold-dark",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  accent: "bg-accent-purple-soft text-accent-purple",
  neutral: "bg-muted-soft text-muted",
};

export function KPICard({
  label,
  value,
  detail,
  icon: Icon,
  variant = "brand",
  href,
  className,
}: KPICardProps) {
  const content = (
    <>
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
          variantClasses[variant]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-semibold text-foreground tabular-nums">
        {value}
      </p>
      <p className="text-sm text-muted mt-0.5">{label}</p>
      {detail && (
        <p className="text-xs text-muted-light mt-1">{detail}</p>
      )}
    </>
  );

  const baseClass = cn(
    "block p-5 bg-white rounded-xl border border-border transition-all",
    href && "hover:border-terracotta/30 hover:shadow-sm group cursor-pointer",
    className
  );

  if (href) {
    return (
      <motion.div variants={staggerItem}>
        <Link href={href} className={baseClass}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerItem} className={baseClass}>
      {content}
    </motion.div>
  );
}
