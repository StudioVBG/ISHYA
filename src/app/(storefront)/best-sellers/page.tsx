"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import { getBestSellers } from "@/lib/demo-data";

export default function BestSellersPage() {
  const products = getBestSellers();

  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <Award className="w-3.5 h-3.5" />
              Les plus aimés
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              Best-sellers
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted max-w-lg mx-auto">
              Les bijoux préférés de nos clientes. Des créations qui ont su
              conquérir les cœurs.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          <p className="text-sm text-muted mb-8">
            <span className="font-medium text-foreground">
              {products.length}
            </span>{" "}
            best-seller{products.length > 1 ? "s" : ""}
          </p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {products.map((product, index) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
