"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]';

function subscribeMedia(query: string) {
  return (callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mm = window.matchMedia(query);
    mm.addEventListener("change", callback);
    return () => mm.removeEventListener("change", callback);
  };
}

function getMediaSnapshot(query: string) {
  return () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;
}

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function CustomCursor() {
  const isFinePointer = useSyncExternalStore(
    subscribeMedia(FINE_POINTER),
    getMediaSnapshot(FINE_POINTER),
    () => false
  );
  const reduceMotion = useSyncExternalStore(
    subscribeMedia(REDUCED_MOTION),
    getMediaSnapshot(REDUCED_MOTION),
    () => false
  );
  const enabled = isFinePointer && !reduceMotion;

  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(true);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xs = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const ys = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("cursor-custom-on");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
    };
    const leaveDoc = () => setHidden(true);
    const enterDoc = () => setHidden(false);

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) setHovering(true);
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) setHovering(false);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseleave", leaveDoc);
    window.addEventListener("mouseenter", enterDoc);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leaveDoc);
      window.removeEventListener("mouseenter", enterDoc);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.classList.remove("cursor-custom-on");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Halo (lent) */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full mix-blend-multiply"
        style={{
          x: xs,
          y: ys,
          translateX: "-50%",
          translateY: "-50%",
          width: hovering ? 56 : 32,
          height: hovering ? 56 : 32,
          background: hovering
            ? "rgba(223, 136, 123, 0.18)"
            : "rgba(223, 136, 123, 0.10)",
          opacity: hidden ? 0 : 1,
          transition:
            "width 0.35s cubic-bezier(0.22,1,0.36,1), height 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s",
        }}
      />
      {/* Point central (rapide) */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-terracotta"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          width: hovering ? 6 : 4,
          height: hovering ? 6 : 4,
          opacity: hidden ? 0 : 1,
          transition: "width 0.2s, height 0.2s",
        }}
      />
    </>
  );
}
