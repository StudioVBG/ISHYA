"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard, type ProductCardProduct } from "./ProductCard";

interface RelatedCarouselProps {
  products: ProductCardProduct[];
}

export function RelatedCarousel({ products }: RelatedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = requestAnimationFrame(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("scroll", onSelect);
    return () => {
      cancelAnimationFrame(id);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("scroll", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden -mx-4 px-4 cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex gap-4 md:gap-6">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="flex-[0_0_70%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_24%] min-w-0"
            >
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls desktop */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        aria-label="Précédent"
        className={cn(
          "hidden md:flex absolute -left-4 top-[40%] -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-white shadow-md border border-border transition-all",
          canPrev
            ? "opacity-100 hover:bg-terracotta hover:text-white hover:border-terracotta"
            : "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        aria-label="Suivant"
        className={cn(
          "hidden md:flex absolute -right-4 top-[40%] -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-white shadow-md border border-border transition-all",
          canNext
            ? "opacity-100 hover:bg-terracotta hover:text-white hover:border-terracotta"
            : "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
