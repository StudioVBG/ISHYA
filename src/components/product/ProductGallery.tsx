"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOutQuart } from "@/lib/animations";

interface MediaItem {
  id: string;
  url: string;
  alt_text: string | null;
  position: number;
}

interface ProductGalleryProps {
  media: MediaItem[];
  productName: string;
  productId: string;
  saleBadge?: string | null;
}

const ZOOM_FACTOR = 2.2;

export function ProductGallery({
  media,
  productName,
  productId,
  saleBadge,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const current = media[active];
  if (!current) return null;

  const goTo = (idx: number) => {
    setDirection(idx > active ? 1 : -1);
    setActive(idx);
  };

  const goPrev = () => goTo((active - 1 + media.length) % media.length);
  const goNext = () => goTo((active + 1) % media.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <div className="md:sticky md:top-24">
      {/* Main image */}
      <div
        ref={imageRef}
        className="relative aspect-[3/4] rounded-xl overflow-hidden bg-beige-nude-light mb-3 group"
        onMouseEnter={() => setZoomActive(true)}
        onMouseLeave={() => setZoomActive(false)}
        onMouseMove={handleMouseMove}
        style={
          { viewTransitionName: `product-${productId}` } as React.CSSProperties
        }
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: easeOutQuart }}
            className="absolute inset-0"
          >
            <Image
              src={current.url}
              alt={current.alt_text ?? productName}
              fill
              priority={active === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Lens zoom (desktop hover) */}
        <AnimatePresence>
          {zoomActive && (
            <motion.div
              key="lens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block pointer-events-none absolute w-44 h-44 rounded-full border-2 border-white/70 shadow-2xl overflow-hidden"
              style={{
                left: `calc(${zoomPos.x}% - 88px)`,
                top: `calc(${zoomPos.y}% - 88px)`,
                backgroundImage: `url(${current.url})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${ZOOM_FACTOR * 100}%`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Hint zoom */}
        <div
          className={cn(
            "hidden md:flex absolute bottom-3 left-3 items-center gap-1.5 bg-foreground/70 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-sm transition-opacity duration-300 pointer-events-none",
            zoomActive ? "opacity-0" : "opacity-100"
          )}
        >
          <ZoomIn className="w-3 h-3" />
          Survoler pour zoomer
        </div>

        {/* Sale badge */}
        {saleBadge && (
          <span className="absolute top-4 left-4 bg-destructive text-white text-xs font-medium px-3 py-1 rounded z-10">
            {saleBadge}
          </span>
        )}

        {/* Prev / Next (mobile + tablet) */}
        {media.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-full shadow-sm"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-full shadow-sm"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dots mobile */}
        {media.length > 1 && (
          <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {media.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => goTo(idx)}
                aria-label={`Image ${idx + 1}`}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  idx === active
                    ? "bg-white w-5"
                    : "bg-white/60 hover:bg-white/85"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails desktop */}
      {media.length > 1 && (
        <div className="hidden md:flex gap-2">
          {media.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => goTo(idx)}
              className={cn(
                "relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300",
                active === idx
                  ? "border-terracotta scale-100"
                  : "border-transparent hover:border-border opacity-70 hover:opacity-100"
              )}
              aria-label={`Voir image ${idx + 1}`}
            >
              <Image
                src={m.url}
                alt={m.alt_text ?? ""}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
