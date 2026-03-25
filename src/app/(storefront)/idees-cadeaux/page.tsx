"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductsByBudget } from "@/lib/demo-data";

const budgetSections = [
  {
    title: "Moins de 30€",
    subtitle: "Des petites attentions qui font plaisir",
    min: 0,
    max: 30,
    accent: "border-terracotta",
  },
  {
    title: "Entre 30€ et 60€",
    subtitle: "Le cadeau idéal pour toutes les occasions",
    min: 30,
    max: 60,
    accent: "border-gold",
  },
  {
    title: "Plus de 60€",
    subtitle: "Des pièces d'exception pour marquer les esprits",
    min: 60,
    max: 9999,
    accent: "border-foreground",
  },
];

export default function IdeesCadeauxPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-beige-nude-light/80 to-terracotta/5 py-16 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <Gift className="w-3.5 h-3.5" />
              Offrir un bijou
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              Idées Cadeaux
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted max-w-lg mx-auto">
              Trouvez le cadeau parfait selon votre budget. Chaque bijou ISHYA
              est livré dans un écrin élégant, prêt à offrir.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {budgetSections.map((section) => {
        const products = getProductsByBudget(section.min, section.max);
        if (products.length === 0) return null;
        return (
          <section key={section.title} className="py-12 px-4">
            <div className="container">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className={`border-l-4 ${section.accent} pl-6 mb-8`}
              >
                <h2 className="font-display text-2xl md:text-3xl mb-1">
                  {section.title}
                </h2>
                <p className="text-sm text-muted">{section.subtitle}</p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
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
        );
      })}
    </>
  );
}
