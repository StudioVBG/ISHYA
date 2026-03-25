"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Check,
  Package,
  Truck,
  MapPin,
  Clock,
  ExternalLink,
  Copy,
  MapPinned,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const trackingEvents = [
  {
    date: "16 mars 2026",
    time: "09:15",
    location: "Centre de tri Colissimo, Paris",
    description: "Colis pris en charge par le transporteur",
    status: "active",
  },
  {
    date: "16 mars 2026",
    time: "11:30",
    location: "Centre de tri régional, Île-de-France",
    description: "Colis en transit vers le centre de distribution",
    status: "active",
  },
  {
    date: "17 mars 2026",
    time: "06:45",
    location: "Centre de distribution, Paris 4ème",
    description: "Colis arrivé au centre de distribution local",
    status: "active",
  },
  {
    date: "17 mars 2026",
    time: "08:00",
    location: "En cours de livraison",
    description: "Le livreur est en route vers votre adresse",
    status: "current",
  },
  {
    date: "17 mars 2026",
    time: "—",
    location: "15 Rue des Fleurs, 75004 Paris",
    description: "Livraison prévue",
    status: "pending",
  },
];

export default function SuiviPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const trackingNumber = "6A12345678901";

  const copyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
  };

  return (
    <div>
      <Link
        href={`/compte/commandes/${orderId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-terracotta transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à la commande
      </Link>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="font-display text-2xl font-semibold">
          Suivi de commande
        </h1>
        <p className="text-sm text-muted mt-1">Commande {orderId}</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid lg:grid-cols-3 gap-6"
      >
        {/* Left - Timeline */}
        <div className="lg:col-span-2">
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-lg font-semibold">
                Historique de suivi
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                En transit
              </span>
            </div>

            <div className="relative">
              {trackingEvents.map((event, i) => {
                const isLast = i === trackingEvents.length - 1;
                const isCurrent = event.status === "current";
                const isCompleted = event.status === "active";
                const isPending = event.status === "pending";

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 pb-8 last:pb-0"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
                          isCompleted && "bg-terracotta text-white",
                          isCurrent &&
                            "bg-terracotta text-white ring-4 ring-terracotta/20",
                          isPending && "bg-gray-100 text-muted"
                        )}
                      >
                        {isCompleted && <Check className="w-4 h-4" />}
                        {isCurrent && (
                          <Truck className="w-4 h-4 animate-pulse" />
                        )}
                        {isPending && <Clock className="w-4 h-4" />}
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "w-0.5 flex-1 mt-1",
                            isCompleted || isCurrent
                              ? "bg-terracotta"
                              : "bg-gray-200 border-l-2 border-dashed border-gray-200"
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-2 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              isPending && "text-muted"
                            )}
                          >
                            {event.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-muted" />
                            <span className="text-xs text-muted">
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium">{event.date}</p>
                          <p className="text-xs text-muted">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right - Info */}
        <div className="space-y-6">
          {/* Carrier info */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold mb-4">Transporteur</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Colissimo</p>
                  <p className="text-xs text-muted">
                    Livraison standard
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted mb-1">
                  Numéro de suivi
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-ivory px-2 py-1 rounded flex-1">
                    {trackingNumber}
                  </code>
                  <button
                    onClick={copyTracking}
                    className="p-1.5 text-muted hover:text-terracotta transition-colors"
                    title="Copier"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <a
                href={`https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-terracotta hover:text-terracotta-dark font-medium"
              >
                Suivre sur Colissimo
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Delivery estimate */}
          <motion.div
            variants={staggerItem}
            className="bg-gradient-to-br from-beige-nude-light to-beige-nude/50 rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold mb-2">
              Livraison estimée
            </h3>
            <p className="text-2xl font-display font-bold text-terracotta">
              19 mars 2026
            </p>
            <p className="text-xs text-muted mt-1">
              Entre 9h et 18h
            </p>
          </motion.div>

          {/* Map placeholder */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border overflow-hidden"
          >
            <div className="aspect-[4/3] bg-beige-nude-light flex items-center justify-center">
              <div className="text-center">
                <MapPinned className="w-8 h-8 text-muted-light mx-auto mb-2" />
                <p className="text-sm text-muted">Carte de suivi</p>
                <p className="text-xs text-muted-light mt-0.5">
                  Disponible prochainement
                </p>
              </div>
            </div>
          </motion.div>

          {/* Delivery address */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold mb-3">
              Adresse de livraison
            </h3>
            <div className="text-sm text-muted space-y-0.5">
              <p className="text-foreground font-medium">Marie Dupont</p>
              <p>15 Rue des Fleurs, Apt 3B</p>
              <p>75004 Paris, France</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
