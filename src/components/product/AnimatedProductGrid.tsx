"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
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
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6",
        className
      )}
    >
      {products.map((product, index) => (
        <motion.div key={product.id} variants={staggerItem}>
          <ProductCard product={product} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
}
