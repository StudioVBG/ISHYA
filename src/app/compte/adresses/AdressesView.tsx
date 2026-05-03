"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Star,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { AccountAddress } from "@/lib/queries/account";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "./actions";

const addressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(2, "Minimum 2 caractères"),
  lastName: z.string().min(2, "Minimum 2 caractères"),
  addressLine1: z.string().min(5, "Adresse requise"),
  addressLine2: z.string().optional(),
  postalCode: z.string().regex(/^\d{4,5}$/, "Code postal invalide"),
  city: z.string().min(2, "Ville requise"),
  country: z.string().min(2, "Pays requis"),
  phone: z.string().optional(),
  type: z.enum(["shipping", "billing"]),
  isDefault: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all";

export function AdressesView({ addresses }: { addresses: AccountAddress[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "France",
      type: "shipping",
      isDefault: false,
    },
  });

  const openCreate = () => {
    setEditingId(null);
    reset({
      label: "",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      country: "France",
      phone: "",
      type: "shipping",
      isDefault: addresses.length === 0,
    });
    setShowModal(true);
  };

  const openEdit = (addr: AccountAddress) => {
    setEditingId(addr.id);
    reset({
      label: addr.label ?? "",
      firstName: addr.firstName,
      lastName: addr.lastName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      postalCode: addr.postalCode,
      city: addr.city,
      country: addr.country,
      phone: addr.phone ?? "",
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setShowModal(true);
  };

  const onSubmit = (data: AddressFormData) => {
    startSaveTransition(async () => {
      const payload = {
        label: data.label?.trim() || null,
        firstName: data.firstName,
        lastName: data.lastName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        phone: data.phone || null,
        type: data.type,
        isDefault: data.isDefault,
      };
      const res = editingId
        ? await updateAddress(editingId, payload)
        : await createAddress(payload);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success(editingId ? "Adresse mise à jour" : "Adresse ajoutée");
      setShowModal(false);
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Supprimer cette adresse ?")) return;
    startDeleteTransition(async () => {
      const res = await deleteAddress(id);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Adresse supprimée");
    });
  };

  const handleSetDefault = (addr: AccountAddress) => {
    startSaveTransition(async () => {
      const res = await setDefaultAddress(addr.id, addr.type);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Adresse par défaut mise à jour");
    });
  };

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Mes adresses
        </h1>
        <button onClick={openCreate} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Ajouter une adresse
        </button>
      </motion.div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-beige-nude-light flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-terracotta" />
          </div>
          <h2 className="font-display text-lg mb-2">
            Aucune adresse enregistrée
          </h2>
          <p className="text-sm text-muted mb-6">
            Ajoutez une adresse pour accélérer vos prochaines commandes.
          </p>
          <button onClick={openCreate} className="btn-primary inline-flex">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une adresse
          </button>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid sm:grid-cols-2 gap-4"
        >
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              variants={staggerItem}
              className={cn(
                "bg-white rounded-xl border p-5 relative",
                addr.isDefault
                  ? "border-terracotta ring-1 ring-terracotta/30"
                  : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{addr.label || "Adresse"}</h3>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium",
                        addr.type === "shipping"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700",
                      )}
                    >
                      {addr.type === "shipping" ? "Livraison" : "Facturation"}
                    </span>
                  </div>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs text-terracotta font-medium mt-1">
                      <Star className="w-3 h-3 fill-current" />
                      Par défaut
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-terracotta transition-colors"
                    aria-label="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={isDeletePending}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-muted space-y-0.5">
                <p className="text-foreground font-medium">
                  {addr.firstName} {addr.lastName}
                </p>
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>
                  {addr.postalCode} {addr.city}
                </p>
                <p>{addr.country}</p>
                {addr.phone && <p className="pt-1">{addr.phone}</p>}
              </div>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr)}
                  disabled={isSavePending}
                  className="text-xs text-terracotta hover:underline mt-3 disabled:opacity-50"
                >
                  Définir par défaut
                </button>
              )}
            </motion.div>
          ))}
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
                <h2 className="font-display text-lg font-semibold">
                  {editingId ? "Modifier l'adresse" : "Nouvelle adresse"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSavePending}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Libellé
                    </label>
                    <input
                      {...register("label")}
                      placeholder="Domicile"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Type
                    </label>
                    <select {...register("type")} className={inputClass}>
                      <option value="shipping">Livraison</option>
                      <option value="billing">Facturation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Prénom *
                    </label>
                    <input
                      {...register("firstName")}
                      className={cn(
                        inputClass,
                        errors.firstName && "border-destructive",
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Nom *
                    </label>
                    <input
                      {...register("lastName")}
                      className={cn(
                        inputClass,
                        errors.lastName && "border-destructive",
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Adresse *
                  </label>
                  <input
                    {...register("addressLine1")}
                    className={cn(
                      inputClass,
                      errors.addressLine1 && "border-destructive",
                    )}
                  />
                  {errors.addressLine1 && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Complément
                  </label>
                  <input
                    {...register("addressLine2")}
                    placeholder="Apt, étage, bâtiment"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Code postal *
                    </label>
                    <input
                      {...register("postalCode")}
                      className={cn(
                        inputClass,
                        errors.postalCode && "border-destructive",
                      )}
                    />
                    {errors.postalCode && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      Ville *
                    </label>
                    <input
                      {...register("city")}
                      className={cn(
                        inputClass,
                        errors.city && "border-destructive",
                      )}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Pays *
                    </label>
                    <select {...register("country")} className={inputClass}>
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Téléphone
                    </label>
                    <input
                      {...register("phone")}
                      placeholder="06 12 34 56 78"
                      className={inputClass}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 bg-beige-nude-light/50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isDefault")}
                    className="w-4 h-4 rounded accent-terracotta"
                  />
                  <span className="text-sm">
                    Définir comme adresse par défaut
                  </span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSavePending}
                    className="btn-secondary flex-1 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSavePending}
                    className="btn-primary flex-1 gap-2"
                  >
                    {isSavePending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
