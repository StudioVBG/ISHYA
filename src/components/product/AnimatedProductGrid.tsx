"use client";

import { AnimatePresence, motion } from "framer-motion";
import { staggerContainer, easeOutQuart } from "@/lib/animations";
import { ProductCard, type ProductCardProduct } from "./ProductCard";
import { cn } from "@/lib/utils";

interface AnimatedProductGridProps {
  products: ProductCardProduct[];
  className?: string;
}

export function AnimatedProductGrid({ products, className }: AnimatedProductGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      layout
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
            transition={{
              layout: { duration: 0.4, ease: easeOutQuart },
              duration: 0.5,
              ease: easeOutQuart,
            }}
          >
            <ProductCard product={product} index={index} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
