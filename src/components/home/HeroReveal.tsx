"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, SplitText);
}

/**
 * Reveal cinématique au mount — masque par lignes et stagger sur les mots.
 * Respecte prefers-reduced-motion (early return).
 */
export function HeroReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !ref.current
      ) {
        return;
      }
      const split = SplitText.create(ref.current, {
        type: "lines,words",
        mask: "lines",
        linesClass: "ishya-line",
      });
      gsap.from(split.words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.04,
        ease: "expo.out",
        delay,
      });
      return () => {
        split.revert();
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
