"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Globe,
  Truck,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createShippingMethod,
  createShippingZone,
  deleteShippingMethod,
  deleteShippingZone,
  updateShippingMethod,
  updateShippingZone,
  type ShippingMethodInput,
  type ShippingZoneInput,
} from "./actions";

export interface ShippingZoneRow {
  id: string;
  name: string;
  countries: string[];
  isActive: boolean;
}

export interface ShippingMethodRow {
  id: string;
  zoneId: string;
  name: string;
  carrier: string | null;
  description: string | null;
  price: number;
  freeAbove: number | null;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
  sortOrder: number;
  isActive: boolean;
}

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta";
const labelClass = "block text-xs font-medium text-foreground mb-1";

interface ZoneFormState {
  name: string;
  countries: string;
  isActive: boolean;
}

const emptyZoneForm: ZoneFormState = {
  name: "",
  countries: "",
  isActive: true,
};

interface MethodFormState {
  zoneId: string;
  name: string;
  carrier: string;
  description: string;
  price: string;
  freeAbove: string;
  estimatedDaysMin: string;
  estimatedDaysMax: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyMethodForm: MethodFormState = {
  zoneId: "",
  name: "",
  carrier: "",
  description: "",
  price: "0",
  freeAbove: "",
  estimatedDaysMin: "",
  estimatedDaysMax: "",
  sortOrder: "0",
  isActive: true,
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function LivraisonView({
  zones,
  methods,
}: {
  zones: ShippingZoneRow[];
  methods: ShippingMethodRow[];
}) {
  // ── Zone modal ─────────────────────────────────────────────────
  const [zoneModal, setZoneModal] = useState(false);
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneFormState>(emptyZoneForm);
  const [isZonePending, startZoneTransition] = useTransition();

  // ── Method modal ───────────────────────────────────────────────
  const [methodModal, setMethodModal] = useState(false);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [methodForm, setMethodForm] = useState<MethodFormState>(emptyMethodForm);
  const [isMethodPending, startMethodTransition] = useTransition();

  const methodsByZone = useMemo(() => {
    const m = new Map<string, ShippingMethodRow[]>();
    for (const method of methods) {
      const arr = m.get(method.zoneId) ?? [];
      arr.push(method);
      m.set(method.zoneId, arr);
    }
    return m;
  }, [methods]);

  // ── Zone handlers ──────────────────────────────────────────────
  const openZoneCreate = () => {
    setZoneId(null);
    setZoneForm(emptyZoneForm);
    setZoneModal(true);
  };

  const openZoneEdit = (z: ShippingZoneRow) => {
    setZoneId(z.id);
    setZoneForm({
      name: z.name,
      countries: z.countries.join(", "),
      isActive: z.isActive,
    });
    setZoneModal(true);
  };

  const handleZoneSave = () => {
    const payload: ShippingZoneInput = {
      name: zoneForm.name,
      countries: zoneForm.countries
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean),
      isActive: zoneForm.isActive,
    };
    startZoneTransition(async () => {
      const res = zoneId
        ? await updateShippingZone(zoneId, payload)
        : await createShippingZone(payload);
      if (res.ok) {
        toast.success(zoneId ? "Zone mise à jour" : "Zone créée");
        setZoneModal(false);
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const handleZoneDelete = (z: ShippingZoneRow) => {
    if (
      !window.confirm(
        `Supprimer la zone "${z.name}" ? Les méthodes liées seront aussi supprimées.`,
      )
    )
      return;
    startZoneTransition(async () => {
      const res = await deleteShippingZone(z.id);
      if (res.ok) toast.success("Zone supprimée");
      else toast.error(res.error || "Erreur");
    });
  };

  // ── Method handlers ───────────────────────────────────────────
  const openMethodCreate = (zoneId: string) => {
    setMethodId(null);
    setMethodForm({ ...emptyMethodForm, zoneId });
    setMethodModal(true);
  };

  const openMethodEdit = (m: ShippingMethodRow) => {
    setMethodId(m.id);
    setMethodForm({
      zoneId: m.zoneId,
      name: m.name,
      carrier: m.carrier ?? "",
      description: m.description ?? "",
      price: String(m.price),
      freeAbove: m.freeAbove != null ? String(m.freeAbove) : "",
      estimatedDaysMin:
        m.estimatedDaysMin != null ? String(m.estimatedDaysMin) : "",
      estimatedDaysMax:
        m.estimatedDaysMax != null ? String(m.estimatedDaysMax) : "",
      sortOrder: String(m.sortOrder),
      isActive: m.isActive,
    });
    setMethodModal(true);
  };

  const handleMethodSave = () => {
    const payload: ShippingMethodInput = {
      zoneId: methodForm.zoneId,
      name: methodForm.name,
      carrier: methodForm.carrier || null,
      description: methodForm.description || null,
      price: Number(methodForm.price),
      freeAbove: methodForm.freeAbove ? Number(methodForm.freeAbove) : null,
      estimatedDaysMin: methodForm.estimatedDaysMin
        ? Number(methodForm.estimatedDaysMin)
        : null,
      estimatedDaysMax: methodForm.estimatedDaysMax
        ? Number(methodForm.estimatedDaysMax)
        : null,
      sortOrder: Number(methodForm.sortOrder) || 0,
      isActive: methodForm.isActive,
    };
    startMethodTransition(async () => {
      const res = methodId
        ? await updateShippingMethod(methodId, payload)
        : await createShippingMethod(payload);
      if (res.ok) {
        toast.success(methodId ? "Méthode mise à jour" : "Méthode créée");
        setMethodModal(false);
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const handleMethodDelete = (m: ShippingMethodRow) => {
    if (!window.confirm(`Supprimer la méthode "${m.name}" ?`)) return;
    startMethodTransition(async () => {
      const res = await deleteShippingMethod(m.id);
      if (res.ok) toast.success("Méthode supprimée");
      else toast.error(res.error || "Erreur");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Zones & méthodes de livraison
          </h2>
          <p className="text-sm text-muted">
            {zones.length} zones · {methods.length} méthodes
          </p>
        </div>
        <button
          onClick={openZoneCreate}
          className="inline-flex items-center gap-2 px-3 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle zone
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="bg-white border border-dashed border-border rounded-lg p-12 text-center">
          <Globe className="w-10 h-10 mx-auto mb-3 text-muted-light" />
          <p className="text-sm text-muted mb-4">
            Aucune zone de livraison configurée. Crée-en une pour commencer.
          </p>
          <button
            onClick={openZoneCreate}
            className="inline-flex items-center gap-2 px-3 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer une zone
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map((z) => {
            const zoneMethods = methodsByZone.get(z.id) ?? [];
            return (
              <div
                key={z.id}
                className="bg-white border border-border rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-muted-soft/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted" />
                      <h3 className="font-semibold text-foreground">{z.name}</h3>
                      {!z.isActive ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {z.countries.length === 0
                        ? "Aucun pays défini"
                        : z.countries.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => openMethodCreate(z.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:border-terracotta/40"
                    >
                      <Plus className="w-3 h-3" />
                      Méthode
                    </button>
                    <button
                      onClick={() => openZoneEdit(z)}
                      className="inline-flex items-center px-2 py-1 text-xs border border-border rounded hover:border-terracotta/40"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      disabled={isZonePending}
                      onClick={() => handleZoneDelete(z)}
                      className="inline-flex items-center px-2 py-1 text-xs border border-destructive/30 text-destructive bg-destructive-soft rounded hover:bg-destructive/15 disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {zoneMethods.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm text-muted">
                    <Package className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    Aucune méthode dans cette zone
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted-soft/30 text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="text-left px-5 py-2 font-semibold">Méthode</th>
                        <th className="text-left px-5 py-2 font-semibold">Transporteur</th>
                        <th className="text-right px-5 py-2 font-semibold">Prix</th>
                        <th className="text-right px-5 py-2 font-semibold">Gratuit dès</th>
                        <th className="text-left px-5 py-2 font-semibold">Délais</th>
                        <th className="text-left px-5 py-2 font-semibold">Statut</th>
                        <th className="text-right px-5 py-2 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {zoneMethods.map((m) => (
                        <tr key={m.id} className="hover:bg-muted-soft/30">
                          <td className="px-5 py-3">
                            <p className="font-medium text-foreground">{m.name}</p>
                            {m.description ? (
                              <p className="text-xs text-muted mt-0.5">
                                {m.description}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-5 py-3 text-muted">{m.carrier ?? "—"}</td>
                          <td className="px-5 py-3 text-right font-medium">
                            {formatMoney(m.price)}
                          </td>
                          <td className="px-5 py-3 text-right text-muted">
                            {m.freeAbove != null ? formatMoney(m.freeAbove) : "—"}
                          </td>
                          <td className="px-5 py-3 text-muted">
                            {m.estimatedDaysMin != null && m.estimatedDaysMax != null
                              ? `${m.estimatedDaysMin}–${m.estimatedDaysMax} j`
                              : m.estimatedDaysMin != null
                                ? `${m.estimatedDaysMin}+ j`
                                : "—"}
                          </td>
                          <td className="px-5 py-3">
                            {m.isActive ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Actif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                Inactif
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => openMethodEdit(m)}
                                className="inline-flex items-center px-2 py-1 text-xs border border-border rounded hover:border-terracotta/40"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                disabled={isMethodPending}
                                onClick={() => handleMethodDelete(m)}
                                className="inline-flex items-center px-2 py-1 text-xs border border-destructive/30 text-destructive bg-destructive-soft rounded hover:bg-destructive/15 disabled:opacity-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Zone modal ─────────────────────────────────── */}
      <AnimatePresence>
        {zoneModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setZoneModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {zoneId ? "Modifier la zone" : "Nouvelle zone"}
                </h3>
                <button
                  onClick={() => setZoneModal(false)}
                  className="p-1 hover:bg-muted-soft rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Nom *</label>
                  <input
                    type="text"
                    value={zoneForm.name}
                    onChange={(e) =>
                      setZoneForm({ ...zoneForm, name: e.target.value })
                    }
                    placeholder="ex. France métropolitaine"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Pays (codes ISO séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={zoneForm.countries}
                    onChange={(e) =>
                      setZoneForm({ ...zoneForm, countries: e.target.value })
                    }
                    placeholder="FR, BE, LU"
                    className={inputClass}
                  />
                  <p className="text-xs text-muted mt-1">
                    Codes ISO 3166-1 alpha-2. Ex : FR, BE, DE.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={zoneForm.isActive}
                    onChange={(e) =>
                      setZoneForm({ ...zoneForm, isActive: e.target.checked })
                    }
                  />
                  Zone active
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setZoneModal(false)}
                  className="px-3 py-2 text-sm text-muted hover:text-foreground"
                >
                  Annuler
                </button>
                <button
                  disabled={isZonePending || !zoneForm.name.trim()}
                  onClick={handleZoneSave}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50"
                >
                  {isZonePending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Method modal ─────────────────────────────── */}
      <AnimatePresence>
        {methodModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setMethodModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {methodId ? "Modifier la méthode" : "Nouvelle méthode"}
                </h3>
                <button
                  onClick={() => setMethodModal(false)}
                  className="p-1 hover:bg-muted-soft rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Zone *</label>
                  <select
                    value={methodForm.zoneId}
                    onChange={(e) =>
                      setMethodForm({ ...methodForm, zoneId: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">— Sélectionner —</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Nom *</label>
                    <input
                      type="text"
                      value={methodForm.name}
                      onChange={(e) =>
                        setMethodForm({ ...methodForm, name: e.target.value })
                      }
                      placeholder="Standard"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Transporteur</label>
                    <input
                      type="text"
                      value={methodForm.carrier}
                      onChange={(e) =>
                        setMethodForm({ ...methodForm, carrier: e.target.value })
                      }
                      placeholder="Colissimo"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    value={methodForm.description}
                    onChange={(e) =>
                      setMethodForm({
                        ...methodForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Livraison à domicile"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Prix (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={methodForm.price}
                      onChange={(e) =>
                        setMethodForm({ ...methodForm, price: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Gratuit dès (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={methodForm.freeAbove}
                      onChange={(e) =>
                        setMethodForm({
                          ...methodForm,
                          freeAbove: e.target.value,
                        })
                      }
                      placeholder="ex. 80"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Délai min (j)</label>
                    <input
                      type="number"
                      min="0"
                      value={methodForm.estimatedDaysMin}
                      onChange={(e) =>
                        setMethodForm({
                          ...methodForm,
                          estimatedDaysMin: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Délai max (j)</label>
                    <input
                      type="number"
                      min="0"
                      value={methodForm.estimatedDaysMax}
                      onChange={(e) =>
                        setMethodForm({
                          ...methodForm,
                          estimatedDaysMax: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ordre</label>
                    <input
                      type="number"
                      value={methodForm.sortOrder}
                      onChange={(e) =>
                        setMethodForm({
                          ...methodForm,
                          sortOrder: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={methodForm.isActive}
                    onChange={(e) =>
                      setMethodForm({
                        ...methodForm,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Méthode active
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setMethodModal(false)}
                  className={cn(
                    "px-3 py-2 text-sm text-muted hover:text-foreground",
                  )}
                >
                  Annuler
                </button>
                <button
                  disabled={
                    isMethodPending ||
                    !methodForm.name.trim() ||
                    !methodForm.zoneId
                  }
                  onClick={handleMethodSave}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50"
                >
                  {isMethodPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
