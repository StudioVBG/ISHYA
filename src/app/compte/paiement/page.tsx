"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash2,
  Shield,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface SavedCard {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const initialCards: SavedCard[] = [
  {
    id: "card-1",
    brand: "Visa",
    last4: "4242",
    expiry: "12/27",
    isDefault: true,
  },
  {
    id: "card-2",
    brand: "Mastercard",
    last4: "8888",
    expiry: "09/28",
    isDefault: false,
  },
];

const brandConfig: Record<string, { bg: string; text: string; label: string }> = {
  Visa: { bg: "bg-blue-600", text: "text-white", label: "VISA" },
  Mastercard: { bg: "bg-red-500", text: "text-white", label: "MC" },
  Amex: { bg: "bg-green-600", text: "text-white", label: "AMEX" },
};

export default function PaiementPage() {
  const [cards, setCards] = useState<SavedCard[]>(initialCards);
  const [showAddModal, setShowAddModal] = useState(false);

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const setDefault = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === id }))
    );
  };

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Moyens de paiement
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une carte
        </button>
      </motion.div>

      {/* Cards list */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4 mb-8"
      >
        {cards.map((card) => {
          const brand = brandConfig[card.brand];
          return (
            <motion.div
              key={card.id}
              variants={staggerItem}
              className={cn(
                "bg-white rounded-xl border p-5 transition-all",
                card.isDefault
                  ? "border-terracotta/30 shadow-sm"
                  : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-14 h-9 rounded-md flex items-center justify-center text-xs font-bold",
                      brand.bg,
                      brand.text
                    )}
                  >
                    {brand.label}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {card.brand} •••• {card.last4}
                      </p>
                      {card.isDefault && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-terracotta/10 text-terracotta rounded-full">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      Expire {card.expiry}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!card.isDefault && (
                    <button
                      onClick={() => setDefault(card.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-terracotta transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-terracotta/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Définir par défaut
                    </button>
                  )}
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="p-2 text-muted hover:text-destructive transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Security notice */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="flex items-start gap-3 p-4 bg-beige-nude-light/50 rounded-xl"
      >
        <Shield className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Paiement sécurisé</p>
          <p className="text-xs text-muted mt-0.5">
            Vos données bancaires sont sécurisées par Stripe. ISHYA ne stocke
            jamais vos numéros de carte complets.
          </p>
        </div>
      </motion.div>

      {/* Add card modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">
                  Ajouter une carte
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Numéro de carte
                  </label>
                  <div className="relative">
                    <input
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all pr-12"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Date d&apos;expiration
                    </label>
                    <input
                      placeholder="MM/AA"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      CVC
                    </label>
                    <input
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Nom sur la carte
                  </label>
                  <input
                    placeholder="MARIE DUPONT"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                <Shield className="w-3.5 h-3.5" />
                Sécurisé par Stripe
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-sm flex-1"
                >
                  Annuler
                </button>
                <button className="btn-primary text-sm flex-1">
                  Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
