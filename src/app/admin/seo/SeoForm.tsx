"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Globe, Twitter, ShieldCheck, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import type { AdminSeoConfig } from "@/lib/queries/admin";
import { updateSeoConfig } from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-foreground mb-1";

export function SeoForm({ config }: { config: AdminSeoConfig }) {
  const [state, setState] = useState<AdminSeoConfig>(config);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AdminSeoConfig>(
    key: K,
    value: AdminSeoConfig[K],
  ) => setState((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSeoConfig(state);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Configuration SEO mise à jour");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-bold text-foreground">SEO</h2>
        <p className="text-sm text-muted">
          Configuration globale du référencement et des partages sociaux.
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-info-soft border border-info/20 rounded-xl p-4 flex items-start gap-3"
      >
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <p className="text-xs text-info">
          Les valeurs vides utilisent les défauts du code (
          <code>src/app/layout.tsx</code>). Les modifications sont écrites dans
          la table <code>settings</code> avec le préfixe <code>seo.*</code> et
          appliquées au prochain rendu.
        </p>
      </motion.div>

      <motion.section
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-terracotta" />
          <h3 className="text-base font-semibold text-foreground">
            Page d&apos;accueil
          </h3>
        </div>
        <div>
          <label className={labelClass}>Meta title</label>
          <input
            type="text"
            value={state.homeMetaTitle}
            onChange={(e) => update("homeMetaTitle", e.target.value)}
            maxLength={70}
            placeholder="ISHYA | Bijoux Floraux Artisanaux"
            className={inputClass}
          />
          <p className="text-xs text-muted-light mt-1">
            {state.homeMetaTitle.length}/70 caractères
          </p>
        </div>
        <div>
          <label className={labelClass}>Meta description</label>
          <textarea
            value={state.homeMetaDescription}
            onChange={(e) => update("homeMetaDescription", e.target.value)}
            rows={3}
            maxLength={160}
            placeholder="Découvrez ISHYA, bijoux artisanaux..."
            className={cn(inputClass, "resize-none")}
          />
          <p className="text-xs text-muted-light mt-1">
            {state.homeMetaDescription.length}/160 caractères
          </p>
        </div>
        <div>
          <label className={labelClass}>Image OpenGraph (1200×630)</label>
          <SingleImageUploader
            value={state.homeOgImageUrl || null}
            onChange={(url) => update("homeOgImageUrl", url ?? "")}
            folder="seo"
            aspect="1200/630"
            disabled={isPending}
            hint="Format recommandé : 1200×630, JPG / PNG / WebP / HEIC."
          />
        </div>
        <div>
          <label className={labelClass}>Mots-clés par défaut</label>
          <input
            type="text"
            value={state.defaultKeywords}
            onChange={(e) => update("defaultKeywords", e.target.value)}
            placeholder="bijoux floraux, fleurs séchées, résine, fait main"
            className={inputClass}
          />
          <p className="text-xs text-muted-light mt-1">Séparés par des virgules.</p>
        </div>
      </motion.section>

      <motion.section
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Twitter className="w-4 h-4 text-terracotta" />
          <h3 className="text-base font-semibold text-foreground">
            Réseaux sociaux
          </h3>
        </div>
        <div>
          <label className={labelClass}>Compte Twitter / X (@handle)</label>
          <input
            type="text"
            value={state.twitterHandle}
            onChange={(e) => update("twitterHandle", e.target.value)}
            placeholder="@ishya"
            className={inputClass}
          />
        </div>
      </motion.section>

      <motion.section
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-terracotta" />
          <h3 className="text-base font-semibold text-foreground">
            Vérifications
          </h3>
        </div>
        <div>
          <label className={labelClass}>Google Search Console (token)</label>
          <input
            type="text"
            value={state.googleSiteVerification}
            onChange={(e) => update("googleSiteVerification", e.target.value)}
            placeholder="Ex: ABCD1234..."
            className={cn(inputClass, "font-mono text-xs")}
          />
        </div>
        <div>
          <label className={labelClass}>Bing Webmaster (token)</label>
          <input
            type="text"
            value={state.bingSiteVerification}
            onChange={(e) => update("bingSiteVerification", e.target.value)}
            placeholder="Ex: ABCD1234..."
            className={cn(inputClass, "font-mono text-xs")}
          />
        </div>
      </motion.section>

      <motion.div
        variants={fadeInUp}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Enregistré" : "Enregistrer"}
        </button>
      </motion.div>
    </motion.div>
  );
}
