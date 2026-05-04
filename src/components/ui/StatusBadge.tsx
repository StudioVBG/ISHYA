import { cn } from "@/lib/utils";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "on_hold"
  | "failed"
  | "requested"
  | "approved"
  | "rejected"
  | "received"
  | "exchanged"
  | "shipped_back"
  | "inspected"
  | "closed";

export type StatusVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "destructive"
  | "accent"
  | "brand";

interface StatusBadgeProps {
  variant?: StatusVariant;
  status?: OrderStatus | string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const variantClasses: Record<StatusVariant, string> = {
  neutral: "bg-muted-soft text-muted",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  destructive: "bg-destructive-soft text-destructive",
  accent: "bg-accent-purple-soft text-accent-purple",
  brand: "bg-terracotta/10 text-terracotta-dark",
};

const orderStatusMap: Record<
  OrderStatus,
  { variant: StatusVariant; label: string }
> = {
  pending: { variant: "neutral", label: "En attente" },
  confirmed: { variant: "info", label: "Payée" },
  processing: { variant: "warning", label: "En préparation" },
  shipped: { variant: "accent", label: "Expédiée" },
  delivered: { variant: "success", label: "Livrée" },
  cancelled: { variant: "destructive", label: "Annulée" },
  refunded: { variant: "warning", label: "Remboursée" },
  partially_refunded: { variant: "warning", label: "Remb. partiel" },
  on_hold: { variant: "neutral", label: "En pause" },
  failed: { variant: "destructive", label: "Échec" },
  requested: { variant: "warning", label: "Demandé" },
  approved: { variant: "info", label: "Approuvé" },
  rejected: { variant: "destructive", label: "Refusé" },
  received: { variant: "accent", label: "Reçu" },
  exchanged: { variant: "success", label: "Échangé" },
  shipped_back: { variant: "accent", label: "Renvoyé" },
  inspected: { variant: "info", label: "Inspecté" },
  closed: { variant: "neutral", label: "Fermé" },
};

const sizeClasses: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export function StatusBadge({
  variant,
  status,
  children,
  className,
  size = "md",
}: StatusBadgeProps) {
  let resolvedVariant: StatusVariant = variant ?? "neutral";
  let label: React.ReactNode = children;

  if (status && status in orderStatusMap) {
    const mapped = orderStatusMap[status as OrderStatus];
    resolvedVariant = variant ?? mapped.variant;
    label = label ?? mapped.label;
  } else if (status && !children) {
    label = status;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full whitespace-nowrap",
        sizeClasses[size],
        variantClasses[resolvedVariant],
        className
      )}
    >
      {label}
    </span>
  );
}
