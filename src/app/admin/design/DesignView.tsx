"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Check, Info, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import type { AdminDesignSettings } from "@/lib/queries/admin";
import { updateDesignSettings } from "./actions";

export function DesignView({ config }: { config: AdminDesignSettings }) {
  const [state, setState] = useState<AdminDesignSettings>(config);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateDesignSettings(state);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Design mis à jour");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl"
    >
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground">Design</h2>
          <p className="text-sm text-steel">
            Personnalisation visuelle de la page d&apos;accueil.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ember text-white rounded-lg font-medium text-sm hover:bg-ember-deep transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Enregistré" : "Enregistrer"}
        </button>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-info-soft border border-info/20 rounded-xl p-4 flex items-start gap-3"
      >
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <p className="text-xs text-info">
          L&apos;image de fond couvre tout le hero plein écran de la page
          d&apos;accueil. Le voile sombre par-dessus garantit la lisibilité du
          titre et des boutons.
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-6 space-y-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-4 h-4 text-ember" />
            <h3 className="text-sm font-semibold text-foreground">
              Image de fond du hero
            </h3>
          </div>
          <p className="text-xs text-steel-soft mb-3">
            Format recommandé : 1920×1080 (16/9) ou plus large. JPG, PNG, WebP
            ou HEIC iPhone — compression automatique.
          </p>
          <SingleImageUploader
            value={state.homeHeroBackgroundUrl || null}
            onChange={(url) =>
              setState((s) => ({ ...s, homeHeroBackgroundUrl: url ?? "" }))
            }
            folder="design"
            aspect="16/9"
            disabled={isPending}
            hint="Format paysage recommandé pour un rendu plein écran"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="overlay-opacity"
              className="text-sm font-medium text-foreground"
            >
              Intensité du voile sombre
            </label>
            <span className="text-xs font-mono text-steel">
              {state.homeHeroOverlayOpacity}%
            </span>
          </div>
          <input
            id="overlay-opacity"
            type="range"
            min={0}
            max={100}
            step={5}
            value={state.homeHeroOverlayOpacity}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                homeHeroOverlayOpacity: Number(e.target.value),
              }))
            }
            disabled={isPending}
            className="w-full accent-ember"
          />
          <p className="text-[11px] text-steel-soft mt-1">
            0% = aucun voile, 100% = image presque masquée. Augmenter si le
            texte est peu lisible sur l&apos;image.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
