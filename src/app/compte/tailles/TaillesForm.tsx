"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ruler, Loader2, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AccountSavedSizes } from "@/lib/queries/account";
import { updateSavedSizes } from "./actions";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta";
const labelClass = "block text-sm font-medium mb-1.5";

export function TaillesForm({ sizes }: { sizes: AccountSavedSizes }) {
  const [state, setState] = useState<AccountSavedSizes>(sizes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AccountSavedSizes>(
    key: K,
    value: AccountSavedSizes[K],
  ) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSavedSizes(state);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Tailles enregistrées");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div>
      <motion.h1
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="font-display text-2xl sm:text-3xl font-semibold mb-2"
      >
        Mes tailles
      </motion.h1>
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="text-sm text-muted mb-8"
      >
        Conservez vos préférences pour des achats plus rapides.
      </motion.p>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6 space-y-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="w-4 h-4 text-terracotta" />
            <h2 className="font-display text-lg font-semibold">
              Bijoux
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Tour de doigt (bague)
              </label>
              <input
                type="text"
                value={state.ringSize ?? ""}
                onChange={(e) => update("ringSize", e.target.value)}
                placeholder="52, 54, 56…"
                className={inputClass}
              />
              <p className="text-xs text-muted mt-1">
                En mm de tour de doigt ou taille FR
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Tour de poignet (bracelet)
              </label>
              <input
                type="text"
                value={state.braceletSize ?? ""}
                onChange={(e) => update("braceletSize", e.target.value)}
                placeholder="16 cm, 18 cm…"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Longueur de collier</label>
              <input
                type="text"
                value={state.necklaceLength ?? ""}
                onChange={(e) => update("necklaceLength", e.target.value)}
                placeholder="40 cm, 45 cm…"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Longueur de chaîne de cheville</label>
              <input
                type="text"
                value={state.ankletLength ?? ""}
                onChange={(e) => update("ankletLength", e.target.value)}
                placeholder="22 cm, 25 cm…"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Étiquette (facultatif)</label>
            <input
              type="text"
              value={state.label ?? ""}
              onChange={(e) => update("label", e.target.value)}
              placeholder="Mes tailles, Maman, Petite sœur…"
              className={inputClass}
            />
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-warning-soft border border-warning/20 rounded-xl p-4 flex items-start gap-3"
        >
          <Info className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            Pas sûre de vos mesures ? Consultez notre{" "}
            <Link
              href="/guide-des-tailles"
              className="underline hover:no-underline"
            >
              guide des tailles
            </Link>{" "}
            pour mesurer chez vous en quelques minutes.
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="btn-primary gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : saved ? (
              <>
                <Save className="w-4 h-4" />
                Enregistré
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer mes tailles
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
