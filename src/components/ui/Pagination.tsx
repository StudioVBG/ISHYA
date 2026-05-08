"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /** Page courante (1-indexée). */
  page: number;
  /** Nombre total de pages. */
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Nombre de pages visibles autour de la courante (de chaque côté). Défaut : 1. */
  siblingCount?: number;
  className?: string;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const ELLIPSIS = "…";

function buildPages(
  page: number,
  totalPages: number,
  siblingCount: number,
): Array<number | typeof ELLIPSIS> {
  // Toujours afficher 1 + page-siblings + page + page+siblings + totalPages
  // ainsi que des "…" entre les blocs disjoints.
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) return range(1, totalPages);

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: Array<number | typeof ELLIPSIS> = [1];
  if (showLeftEllipsis) pages.push(ELLIPSIS);
  for (const n of range(
    showLeftEllipsis ? leftSibling : 2,
    showRightEllipsis ? rightSibling : totalPages - 1,
  )) {
    pages.push(n);
  }
  if (showRightEllipsis) pages.push(ELLIPSIS);
  pages.push(totalPages);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages, siblingCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-sm text-muted hover:text-terracotta hover:border-terracotta disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p, i) =>
        p === ELLIPSIS ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="inline-flex items-center justify-center w-9 h-9 text-sm text-muted-light"
          >
            {ELLIPSIS}
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-colors",
              p === page
                ? "bg-terracotta text-white"
                : "border border-border text-foreground hover:border-terracotta hover:text-terracotta",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-sm text-muted hover:text-terracotta hover:border-terracotta disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Page suivante"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
