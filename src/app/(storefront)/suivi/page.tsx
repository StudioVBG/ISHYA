"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const demoTimeline = [
  {
    icon: CheckCircle2,
    title: "Commande confirmée",
    date: "18 mars 2026 – 14h32",
    desc: "Votre paiement a été validé",
    done: true,
  },
  {
    icon: Package,
    title: "En préparation",
    date: "18 mars 2026 – 16h10",
    desc: "Votre colis est en cours d'emballage dans notre atelier",
    done: true,
  },
  {
    icon: Truck,
    title: "Expédiée",
    date: "19 mars 2026 – 09h45",
    desc: "Pris en charge par Colissimo – N° 6A12345678901",
    done: true,
  },
  {
    icon: MapPin,
    title: "En transit",
    date: "19 mars 2026 – 18h22",
    desc: "Votre colis est au centre de tri de Villepinte",
    done: true,
  },
  {
    icon: PackageCheck,
    title: "Livrée",
    date: "Estimation : 21 mars 2026",
    desc: "Livraison prévue à l'adresse indiquée",
    done: false,
  },
];

export default function SuiviPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-beige-nude-light/50 py-16 md:py-24 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <Package className="w-3.5 h-3.5" />
              Suivi
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Suivre ma commande
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted">
              Entrez votre numéro de commande et votre adresse email pour suivre
              votre colis en temps réel.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Search form */}
          <motion.form
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            onSubmit={handleSubmit}
            className="bg-white border border-border rounded-2xl p-6 md:p-8 space-y-4 mb-12"
          >
            <motion.div variants={fadeInUp}>
              <label
                htmlFor="order"
                className="block text-sm font-medium mb-2"
              >
                Numéro de commande
              </label>
              <input
                id="order"
                type="text"
                required
                placeholder="Ex : ISH-M1A2B3C-XY4Z"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-3 bg-ivory border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label
                htmlFor="track-email"
                className="block text-sm font-medium mb-2"
              >
                Adresse email
              </label>
              <input
                id="track-email"
                type="email"
                required
                placeholder="L'email utilisé lors de la commande"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-ivory border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <button type="submit" className="btn-primary w-full gap-2">
                <Search className="w-4 h-4" />
                Rechercher
              </button>
            </motion.div>
          </motion.form>

          {/* Results */}
          {searched && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Order summary */}
              <motion.div
                variants={fadeInUp}
                className="bg-white border border-border rounded-2xl p-6 md:p-8 mb-8"
              >
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">
                      Commande
                    </p>
                    <p className="font-medium">
                      {orderNumber || "ISH-M1A2B3C-XY4Z"}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-gold/10 text-gold-dark px-3 py-1 rounded-full text-xs font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    En transit
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted mb-0.5">Date de commande</p>
                    <p className="font-medium">18 mars 2026</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Transporteur</p>
                    <p className="font-medium">Colissimo</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Livraison estimée</p>
                    <p className="font-medium">21 mars 2026</p>
                  </div>
                </div>
              </motion.div>

              {/* Timeline */}
              <motion.div
                variants={fadeInUp}
                className="bg-white border border-border rounded-2xl p-6 md:p-8"
              >
                <h2 className="font-display text-xl mb-8">
                  Historique du suivi
                </h2>
                <div className="relative">
                  {demoTimeline.map((step, i) => {
                    const Icon = step.icon;
                    const isLast = i === demoTimeline.length - 1;
                    return (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        className="flex gap-4 pb-8 last:pb-0"
                      >
                        {/* Line + dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                              step.done
                                ? "bg-terracotta border-terracotta text-white"
                                : "bg-white border-border text-muted"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                "w-0.5 flex-1 min-h-[2rem]",
                                step.done ? "bg-terracotta" : "bg-border"
                              )}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pt-1.5 pb-2">
                          <p
                            className={cn(
                              "font-medium text-sm",
                              !step.done && "text-muted"
                            )}
                          >
                            {step.title}
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {step.date}
                          </p>
                          <p className="text-sm text-muted mt-1">{step.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Help */}
              <motion.div
                variants={fadeInUp}
                className="mt-8 bg-beige-nude-light/50 rounded-xl p-5 text-center"
              >
                <p className="text-sm text-muted">
                  Un problème avec votre livraison ?{" "}
                  <a
                    href="/contact"
                    className="text-terracotta font-medium hover:underline"
                  >
                    Contactez-nous
                  </a>
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
