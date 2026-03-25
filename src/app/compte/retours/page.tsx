"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
} from "lucide-react";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const returnStatusConfig: Record<
  string,
  { color: string; bgColor: string; icon: React.ElementType }
> = {
  "En attente": {
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  Approuvé: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  "En transit": {
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Truck,
  },
  Reçu: {
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Package,
  },
  Remboursé: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  Refusé: {
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
};

const demoReturns = [
  {
    id: "RET-001",
    orderId: "ISH-2K5M1B-T4P7",
    date: "2026-03-12T10:00:00Z",
    status: "En transit",
    reason: "Mauvaise taille",
    items: [{ name: "Collier Fleur d'Oranger", qty: 1, price: 45 }],
    refundAmount: 45,
  },
  {
    id: "RET-002",
    orderId: "ISH-2K4H9C-J6N1",
    date: "2026-02-28T14:00:00Z",
    status: "Remboursé",
    reason: "Ne correspond pas à la description",
    items: [{ name: "Pack Duo Floral", qty: 1, price: 72 }],
    refundAmount: 72,
  },
];

export default function RetoursPage() {
  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Mes retours
        </h1>
        <Link
          href="/compte/commandes"
          className="btn-primary text-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Créer un retour
        </Link>
      </motion.div>

      {/* Return policy reminder */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 p-4 bg-beige-nude-light/50 rounded-xl mb-8"
      >
        <RotateCcw className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Politique de retour</p>
          <p className="text-xs text-muted mt-0.5">
            Vous disposez de 30 jours après réception pour retourner un article.
            Les articles doivent être dans leur état d&apos;origine, non portés et
            dans leur emballage. Le remboursement est effectué sous 5 à 10 jours
            ouvrés après réception du retour.
          </p>
        </div>
      </motion.div>

      {demoReturns.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center py-16"
        >
          <RotateCcw className="w-12 h-12 text-muted-light mx-auto mb-4" />
          <p className="text-lg font-medium text-muted">Aucun retour</p>
          <p className="text-sm text-muted-light mt-1">
            Vous n&apos;avez effectué aucune demande de retour
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {demoReturns.map((ret) => {
            const config = returnStatusConfig[ret.status];
            const StatusIcon = config?.icon || Clock;
            return (
              <motion.div
                key={ret.id}
                variants={staggerItem}
                className="bg-white rounded-xl border border-border p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-beige-nude-light flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-terracotta" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Retour {ret.id}</p>
                      <p className="text-xs text-muted">
                        Commande {ret.orderId} •{" "}
                        {formatDate(ret.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium w-fit",
                      config?.bgColor,
                      config?.color
                    )}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {ret.status}
                  </span>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted mb-2">
                    Motif : {ret.reason}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ret.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-xs bg-ivory px-2 py-1 rounded"
                      >
                        {item.name} ×{item.qty}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      Remboursement :{" "}
                      <span className="font-semibold">
                        {formatPrice(ret.refundAmount)}
                      </span>
                    </p>
                    <Link
                      href={`/compte/commandes/${ret.orderId}`}
                      className="flex items-center gap-1 text-xs font-medium text-terracotta hover:text-terracotta-dark"
                    >
                      Voir la commande
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
