"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Settings,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminSettingRow } from "@/lib/queries/admin";
import { deleteSetting, upsertSetting } from "./actions";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-foreground mb-1";

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function previewValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
}

interface FormState {
  id?: string;
  key: string;
  description: string;
  rawValue: string;
}

const emptyForm: FormState = {
  key: "",
  description: "",
  rawValue: "",
};

export function ParametresView({
  settings,
  canEdit,
  canDelete,
}: {
  settings: AdminSettingRow[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const deletingSetting = settings.find((s) => s.id === deletingId);

  const openCreate = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s: AdminSettingRow) => {
    setForm({
      id: s.id,
      key: s.key,
      description: s.description ?? "",
      rawValue: stringifyValue(s.value),
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.key.trim()) {
      toast.error("Clé requise");
      return;
    }
    startSaveTransition(async () => {
      const res = await upsertSetting({
        id: form.id,
        key: form.key,
        description: form.description.trim() || null,
        value: undefined,
        rawValue: form.rawValue,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(form.id ? "Paramètre mis à jour" : "Paramètre créé");
      setShowModal(false);
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startDeleteTransition(async () => {
      const res = await deleteSetting(id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        setDeletingId(null);
        return;
      }
      toast.success("Paramètre supprimé");
      setDeletingId(null);
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground">Paramètres</h2>
          <p className="text-sm text-muted">
            {settings.length} clé{settings.length > 1 ? "s" : ""} de
            configuration
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-lg font-medium text-sm hover:bg-terracotta-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle clé
          </button>
        )}
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="bg-info-soft border border-info/20 rounded-xl p-4 flex items-start gap-3"
      >
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <p className="text-xs text-info">
          Ces paramètres sont stockés dans la table <code>settings</code> en
          base. La valeur peut être du JSON, une chaîne, un booléen ou un
          nombre — on tente d&apos;abord de parser en JSON, sinon on stocke en
          chaîne. Modifiez avec précaution : certaines clés sont consommées au
          runtime.
        </p>
      </motion.div>

      {settings.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-12 text-center text-muted-light"
        >
          <Settings className="w-8 h-8 mx-auto mb-2 text-muted-light" />
          Aucun paramètre défini.
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border overflow-hidden"
        >
          <div className="divide-y divide-border/50">
            {settings.map((s) => (
              <div key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {s.key}
                    </p>
                    {s.description && (
                      <p className="text-xs text-muted mt-0.5">
                        {s.description}
                      </p>
                    )}
                    <div className="mt-2 bg-muted-soft rounded-lg p-2 font-mono text-xs text-foreground break-all">
                      {previewValue(s.value)}
                    </div>
                    {s.updatedAt && (
                      <p className="text-[10px] text-muted-light mt-1">
                        Mis à jour le {formatDate(s.updatedAt)}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-muted-soft text-muted hover:text-terracotta transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => setDeletingId(s.id)}
                          disabled={isDeletePending}
                          className="p-1.5 rounded-lg hover:bg-muted-soft text-muted hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isSavePending && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">
                  {form.id ? "Modifier le paramètre" : "Nouveau paramètre"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="p-1.5 rounded-lg hover:bg-muted-soft text-muted disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>Clé *</label>
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) =>
                      setForm({ ...form, key: e.target.value })
                    }
                    disabled={!!form.id}
                    className={cn(inputClass, "font-mono", form.id && "bg-muted-soft cursor-not-allowed")}
                    placeholder="contact_email, business_hours…"
                  />
                  {form.id && (
                    <p className="text-xs text-muted-light mt-1">
                      La clé n&apos;est pas modifiable. Supprimez et recréez
                      pour la changer.
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className={inputClass}
                    placeholder="À quoi sert cette clé ?"
                  />
                </div>
                <div>
                  <label className={labelClass}>Valeur (JSON ou texte)</label>
                  <textarea
                    value={form.rawValue}
                    onChange={(e) =>
                      setForm({ ...form, rawValue: e.target.value })
                    }
                    rows={6}
                    className={cn(inputClass, "font-mono text-xs resize-none")}
                    placeholder={'true, 42, "hello", { "fr": "Bonjour" }'}
                  />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-border">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted-soft transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSavePending}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                >
                  {isSavePending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer ce paramètre ?"
        description={
          deletingSetting
            ? `Le paramètre « ${deletingSetting.key} » sera supprimé. Cela peut casser le site.`
            : "Cela peut casser le site."
        }
        confirmLabel="Supprimer"
        tone="destructive"
        pending={isDeletePending}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}
