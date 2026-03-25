"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Package,
  Tag,
  RefreshCw,
  Mail,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface NotifPreference {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  email: boolean;
  push: boolean;
}

const initialPreferences: NotifPreference[] = [
  {
    id: "orders",
    label: "Mises à jour commandes",
    description:
      "Confirmations, expéditions, livraisons et mises à jour de vos commandes",
    icon: Package,
    email: true,
    push: true,
  },
  {
    id: "promotions",
    label: "Promotions & offres",
    description:
      "Ventes privées, codes promo et offres spéciales réservées aux membres",
    icon: Tag,
    email: true,
    push: false,
  },
  {
    id: "restock",
    label: "Alertes réapprovisionnement",
    description:
      "Notifications lorsqu'un article de votre liste de souhaits est de retour en stock",
    icon: RefreshCw,
    email: true,
    push: true,
  },
  {
    id: "newsletter",
    label: "Newsletter",
    description:
      "Nouveautés, inspirations, conseils d'entretien et coulisses de l'atelier ISHYA",
    icon: Mail,
    email: true,
    push: false,
  },
];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta/30",
        checked ? "bg-terracotta" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saved, setSaved] = useState(false);

  const togglePref = (id: string, channel: "email" | "push") => {
    setPreferences((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [channel]: !p[channel] } : p
      )
    );
    setSaved(false);
  };

  const save = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Notifications
        </h1>
        <p className="text-sm text-muted mt-1">
          Choisissez comment vous souhaitez être informée
        </p>
      </motion.div>

      {/* Channel headers */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="hidden sm:grid sm:grid-cols-[1fr_80px_80px] gap-4 px-5 pb-3 text-xs font-medium text-muted uppercase tracking-wider"
      >
        <span />
        <span className="text-center flex items-center justify-center gap-1">
          <Mail className="w-3.5 h-3.5" />
          E-mail
        </span>
        <span className="text-center flex items-center justify-center gap-1">
          <Smartphone className="w-3.5 h-3.5" />
          Push
        </span>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3 mb-8"
      >
        {preferences.map((pref) => {
          const Icon = pref.icon;
          return (
            <motion.div
              key={pref.id}
              variants={staggerItem}
              className="bg-white rounded-xl border border-border p-5"
            >
              <div className="grid sm:grid-cols-[1fr_80px_80px] gap-4 items-center">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-beige-nude-light flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-terracotta" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {pref.description}
                    </p>
                  </div>
                </div>

                {/* Mobile: inline toggles */}
                <div className="sm:hidden flex items-center gap-6 pl-12">
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <Mail className="w-3.5 h-3.5" />
                    E-mail
                    <ToggleSwitch
                      checked={pref.email}
                      onChange={() => togglePref(pref.id, "email")}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <Smartphone className="w-3.5 h-3.5" />
                    Push
                    <ToggleSwitch
                      checked={pref.push}
                      onChange={() => togglePref(pref.id, "push")}
                    />
                  </label>
                </div>

                {/* Desktop: centered toggles */}
                <div className="hidden sm:flex justify-center">
                  <ToggleSwitch
                    checked={pref.email}
                    onChange={() => togglePref(pref.id, "email")}
                  />
                </div>
                <div className="hidden sm:flex justify-center">
                  <ToggleSwitch
                    checked={pref.push}
                    onChange={() => togglePref(pref.id, "push")}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Save */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <button onClick={save} className="btn-primary text-sm">
          {saved ? "Préférences enregistrées !" : "Enregistrer les préférences"}
        </button>
      </motion.div>

      {/* Info */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="mt-8 p-4 bg-beige-nude-light/50 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">
              À propos de vos notifications
            </p>
            <p className="text-xs text-muted mt-1">
              Les notifications transactionnelles (confirmations de commande,
              factures) seront toujours envoyées par e-mail, indépendamment de
              vos préférences. Vous pouvez vous désinscrire à tout moment
              conformément au RGPD.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
