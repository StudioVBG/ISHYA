import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn(
        "flex items-center text-xs text-muted overflow-x-auto whitespace-nowrap",
        className,
      )}
    >
      <ol className="flex items-center gap-1.5 min-w-0">
        <li className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center hover:text-terracotta transition-colors"
            aria-label="Accueil"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="w-3 h-3 text-muted-light shrink-0" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-terracotta transition-colors truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    isLast && "text-foreground font-medium",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
