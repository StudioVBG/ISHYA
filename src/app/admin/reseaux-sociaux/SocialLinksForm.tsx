"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Info,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PinterestIcon, TikTokIcon } from "@/components/icons/social";
import type { AdminSocialLinks } from "@/lib/queries/admin";
import { updateSocialLinks } from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";

interface FieldDef {
  key: keyof AdminSocialLinks;
  label: string;
  type: "url" | "email";
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  help?: string;
}

const FIELDS: FieldDef[] = [
  {
    key: "instagramUrl",
    label: "Instagram",
    type: "url",
    icon: Instagram,
    placeholder: "https://instagram.com/ishya",
  },
  {
    key: "facebookUrl",
    label: "Facebook",
    type: "url",
    icon: Facebook,
    placeholder: "https://facebook.com/ishya",
  },
  {
    key: "pinterestUrl",
    label: "Pinterest",
    type: "url",
    icon: PinterestIcon,
    placeholder: "https://pinterest.com/ishya",
  },
  {
    key: "tiktokUrl",
    label: "TikTok",
    type: "url",
    icon: TikTokIcon,
    placeholder: "https://tiktok.com/@ishya",
  },
  {
    key: "youtubeUrl",
    label: "YouTube",
    type: "url",
    icon: Youtube,
    placeholder: "https://youtube.com/@ishya",
  },
  {
    key: "contactEmail",
    label: "Email de contact",
    type: "email",
    icon: Mail,
    placeholder: "contact@ishya.fr",
    help: "Affiché en tant que lien mailto: dans le footer.",
  },
];

export function SocialLinksForm({ config }: { config: AdminSocialLinks }) {
  const [state, setState] = useState<AdminSocialLinks>(config);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AdminSocialLinks>(
    key: K,
    value: AdminSocialLinks[K],
  ) => setState((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSocialLinks(state);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Liens réseaux sociaux mis à jour");
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
          <h2 className="text-xl font-bold text-foreground">
            Réseaux sociaux
          </h2>
          <p className="text-sm text-muted">
            Liens affichés dans le footer du storefront. Laissez vide pour
            masquer un réseau.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors disabled:opacity-50"
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
          Les URLs doivent commencer par <code>https://</code>. Toutes les
          modifications sont visibles immédiatement sur le storefront (cache
          revalidé).
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-white rounded-xl border border-border p-6 space-y-5"
      >
        {FIELDS.map((field) => {
          const Icon = field.icon;
          const value = state[field.key] ?? "";
          const hasValue = value.trim().length > 0;
          return (
            <div key={field.key}>
              <label className="flex items-center gap-2 text-xs font-medium text-foreground mb-1.5">
                <Icon
                  className={cn(
                    "w-4 h-4",
                    hasValue ? "text-terracotta" : "text-muted-light",
                  )}
                />
                {field.label}
              </label>
              <input
                type={field.type}
                value={value}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={inputClass}
                disabled={isPending}
              />
              {field.help && (
                <p className="text-[11px] text-muted-light mt-1">
                  {field.help}
                </p>
              )}
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
