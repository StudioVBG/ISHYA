import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  count?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showCount?: boolean;
  showValue?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<StarRatingProps["size"]>, string> = {
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function StarRating({
  value,
  count,
  size = "sm",
  showCount = true,
  showValue = false,
  className,
}: StarRatingProps) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={`Note : ${value.toFixed(1)} sur 5${count ? `, ${count} avis` : ""}`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              SIZE_CLASS[size],
              i < rounded
                ? "fill-gold text-gold"
                : "fill-border text-border",
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-medium text-foreground">
          {value.toFixed(1)}
        </span>
      )}
      {showCount && count !== undefined && count > 0 && (
        <span className="text-xs text-muted">({count})</span>
      )}
    </span>
  );
}
