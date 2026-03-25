"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import { getNewProducts } from "@/lib/demo-data";

export default function NouveautesPage() {
  const products = getNewProducts();

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
            <motion.p
              variants={fadeInUp}
              className="text-terracotta uppercase tracking-widest text-xs mb-3"
            >
              Fraîchement arrivés
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              Nouveautés
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted max-w-lg mx-auto">
              Découvrez nos dernières créations florales, tout juste sorties de
              notre atelier.
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
            nouveauté{products.length > 1 ? "s" : ""}
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

          {products.length === 0 && (
            <p className="text-center text-muted py-20">
              Aucune nouveauté pour le moment. Revenez bientôt !
            </p>
          )}
        </div>
      </section>
    </>
  );
}
