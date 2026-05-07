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

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.45a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.08Z" />
    </svg>
  );
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
