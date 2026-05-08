"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import { ReactLenis } from "lenis/react";

/**
 * Smooth scroll Lenis (Darkroom Engineering, ~3 KB).
 * - Désactivé automatiquement si `prefers-reduced-motion: reduce` (a11y).
 * - Désactivé sous mobile/tactile : Lenis dégrade l'INP sur terminaux bas de
 *   gamme et entre en conflit avec les gestures natifs (pull-to-refresh,
 *   momentum scroll iOS).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const enabled = useSmoothScrollEnabled();

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.1,
        syncTouch: false,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

// useSyncExternalStore : pattern canonique React 19 pour synchroniser un
// état React avec une source externe (matchMedia) sans déclencher
// l'anti-pattern useEffect+setState.
function useSmoothScrollEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  reduceQuery.addEventListener("change", callback);
  fineQuery.addEventListener("change", callback);
  return () => {
    reduceQuery.removeEventListener("change", callback);
    fineQuery.removeEventListener("change", callback);
  };
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  return !reduced && finePointer;
}

function getServerSnapshot(): boolean {
  return false;
}
