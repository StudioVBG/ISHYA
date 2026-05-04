"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Smartphone, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AccountNotificationPrefs } from "@/lib/queries/account";
import { updateNotificationPrefs } from "./actions";

export function NotificationsForm({
  prefs,
}: {
  prefs: AccountNotificationPrefs;
}) {
  const [state, setState] = useState<AccountNotificationPrefs>(prefs);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleToggle = <K extends keyof AccountNotificationPrefs>(
    key: K,
    value: AccountNotificationPrefs[K],
  ) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateNotificationPrefs(state);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Préférences enregistrées");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const Toggle = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="flex items-start justify-between gap-4 p-4 bg-beige-nude-light/30 rounded-lg cursor-pointer hover:bg-beige-nude-light/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      <div className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-terracotta peer-focus:ring-2 peer-focus:ring-terracotta/30 transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
      </div>
    </label>
  );

  return (
    <div>
      <motion.h1
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="font-display text-2xl sm:text-3xl font-semibold mb-2"
      >
        Notifications
      </motion.h1>
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="text-sm text-muted mb-8"
      >
        Choisissez les communications que vous souhaitez recevoir.
      </motion.p>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.section
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-terracotta" />
            <h2 className="font-display text-lg font-semibold">E-mails</h2>
          </div>
          <div className="space-y-3">
            <Toggle
              label="Newsletter & promotions"
              description="Nouveautés, offres exclusives et collections en avant-première"
              checked={state.emailMarketing}
              onChange={(v) => handleToggle("emailMarketing", v)}
            />
            <Toggle
              label="Suivi de commande"
              description="Confirmations, expéditions et livraisons (recommandé)"
              checked={state.emailOrderUpdates}
              onChange={(v) => handleToggle("emailOrderUpdates", v)}
            />
            <Toggle
              label="Réponses à mes avis"
              description="Quand notre équipe répond à un de vos avis"
              checked={state.emailReviewReplies}
              onChange={(v) => handleToggle("emailReviewReplies", v)}
            />
          </div>
        </motion.section>

        <motion.section
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-terracotta" />
            <h2 className="font-display text-lg font-semibold">SMS</h2>
          </div>
          <div className="space-y-3">
            <Toggle
              label="Suivi de commande par SMS"
              description="Notifications d'expédition et de livraison"
              checked={state.smsOrderUpdates}
              onChange={(v) => handleToggle("smsOrderUpdates", v)}
            />
            <Toggle
              label="Promotions par SMS"
              description="Offres flash et ventes privées"
              checked={state.smsMarketing}
              onChange={(v) => handleToggle("smsMarketing", v)}
            />
          </div>
        </motion.section>

        <motion.section
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-terracotta" />
            <h2 className="font-display text-lg font-semibold">
              Notifications push
            </h2>
          </div>
          <Toggle
            label="Activer les notifications push"
            description="Recevez des alertes directement dans votre navigateur"
            checked={state.pushEnabled}
            onChange={(v) => handleToggle("pushEnabled", v)}
          />
        </motion.section>

        <motion.div
          variants={staggerItem}
          className="flex items-center justify-between bg-warning-soft border border-warning/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-warning">
              Conformément au RGPD, vous pouvez vous désabonner à tout moment.
              Le suivi de commande est conservé pour des raisons légales et
              opérationnelles.
            </p>
          </div>
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
                Enregistrer mes préférences
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
