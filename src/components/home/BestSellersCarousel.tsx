"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { ProductCard, type ProductCardProduct } from "@/components/product/ProductCard";

interface BestSellersCarouselProps {
  products: ProductCardProduct[];
}

export function BestSellersCarousel({ products }: BestSellersCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (products.length === 0) return null;

  return (
    <>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="flex items-end justify-between mb-10"
      >
        <div>
          <p className="text-terracotta uppercase tracking-widest text-xs mb-2">
            Les favoris
          </p>
          <h2 className="font-display text-3xl md:text-4xl">Nos Best-sellers</h2>
        </div>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={scrollPrev}
            className="p-2.5 rounded-full border border-border hover:border-terracotta hover:text-terracotta transition-colors"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="p-2.5 rounded-full border border-border hover:border-terracotta hover:text-terracotta transition-colors"
            aria-label="Suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex-[0_0_50%] md:flex-[0_0_25%] pl-4 min-w-0"
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex sm:hidden justify-center gap-2 mt-6">
        <button
          onClick={scrollPrev}
          className="p-2.5 rounded-full border border-border"
          aria-label="Précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollNext}
          className="p-2.5 rounded-full border border-border"
          aria-label="Suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
