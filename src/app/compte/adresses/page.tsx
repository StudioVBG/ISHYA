"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Home,
  Building,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const addressSchema = z.object({
  label: z.string().min(1, "Requis"),
  firstName: z.string().min(2, "Minimum 2 caractères"),
  lastName: z.string().min(2, "Minimum 2 caractères"),
  street: z.string().min(5, "Adresse requise"),
  complement: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide"),
  city: z.string().min(2, "Ville requise"),
  country: z.string().min(2, "Pays requis"),
  phone: z.string().optional(),
  isDefaultShipping: z.boolean(),
  isDefaultBilling: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address extends AddressFormData {
  id: string;
}

const initialAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Domicile",
    firstName: "Marie",
    lastName: "Dupont",
    street: "15 Rue des Fleurs",
    complement: "Apt 3B",
    postalCode: "75004",
    city: "Paris",
    country: "France",
    phone: "06 12 34 56 78",
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    id: "addr-2",
    label: "Bureau",
    firstName: "Marie",
    lastName: "Dupont",
    street: "42 Avenue des Champs-Élysées",
    complement: "5ème étage",
    postalCode: "75008",
    city: "Paris",
    country: "France",
    phone: "01 23 45 67 89",
    isDefaultShipping: false,
    isDefaultBilling: false,
  },
];

export default function AdressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "France",
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
  });

  const openModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      reset(address);
    } else {
      setEditingId(null);
      reset({
        label: "",
        firstName: "",
        lastName: "",
        street: "",
        complement: "",
        postalCode: "",
        city: "",
        country: "France",
        phone: "",
        isDefaultShipping: false,
        isDefaultBilling: false,
      });
    }
    setShowModal(true);
  };

  const onSubmit = async (data: AddressFormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...data } : a))
      );
    } else {
      setAddresses((prev) => [
        ...prev,
        { ...data, id: `addr-${Date.now()}` },
      ]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all";

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Mes adresses
        </h1>
        <button
          onClick={() => openModal()}
          className="btn-primary text-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une adresse
        </button>
      </motion.div>

      {addresses.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center py-16"
        >
          <MapPin className="w-12 h-12 text-muted-light mx-auto mb-4" />
          <p className="text-lg font-medium text-muted">
            Aucune adresse enregistrée
          </p>
          <p className="text-sm text-muted-light mt-1">
            Ajoutez une adresse de livraison pour faciliter vos commandes
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid sm:grid-cols-2 gap-4"
        >
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              variants={staggerItem}
              className="bg-white rounded-xl border border-border p-5 relative group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-beige-nude-light flex items-center justify-center">
                    {address.label === "Bureau" ? (
                      <Building className="w-4 h-4 text-terracotta" />
                    ) : (
                      <Home className="w-4 h-4 text-terracotta" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{address.label}</span>
                </div>
                <div className="flex gap-1">
                  {address.isDefaultShipping && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-terracotta/10 text-terracotta rounded-full">
                      Livraison par défaut
                    </span>
                  )}
                  {address.isDefaultBilling && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gold/10 text-gold-dark rounded-full">
                      Facturation par défaut
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted space-y-0.5">
                <p className="text-foreground font-medium">
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.street}</p>
                {address.complement && <p>{address.complement}</p>}
                <p>
                  {address.postalCode} {address.city}
                </p>
                <p>{address.country}</p>
                {address.phone && <p className="mt-1">{address.phone}</p>}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => openModal(address)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-terracotta transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => deleteAddress(address.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Address Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">
                  {editingId ? "Modifier l'adresse" : "Nouvelle adresse"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Libellé (ex: Domicile, Bureau)
                  </label>
                  <input
                    {...register("label")}
                    className={cn(
                      inputClass,
                      errors.label && "border-destructive"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Prénom
                    </label>
                    <input
                      {...register("firstName")}
                      className={cn(
                        inputClass,
                        errors.firstName && "border-destructive"
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Nom
                    </label>
                    <input
                      {...register("lastName")}
                      className={cn(
                        inputClass,
                        errors.lastName && "border-destructive"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Adresse
                  </label>
                  <input
                    {...register("street")}
                    className={cn(
                      inputClass,
                      errors.street && "border-destructive"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Complément
                  </label>
                  <input
                    {...register("complement")}
                    placeholder="Appartement, bâtiment, étage..."
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Code postal
                    </label>
                    <input
                      {...register("postalCode")}
                      className={cn(
                        inputClass,
                        errors.postalCode && "border-destructive"
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Ville
                    </label>
                    <input
                      {...register("city")}
                      className={cn(
                        inputClass,
                        errors.city && "border-destructive"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Pays
                    </label>
                    <input {...register("country")} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Téléphone
                    </label>
                    <input {...register("phone")} className={inputClass} />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isDefaultShipping")}
                      className="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta accent-[var(--terracotta)]"
                    />
                    <span className="text-sm">
                      Adresse de livraison par défaut
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isDefaultBilling")}
                      className="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta accent-[var(--terracotta)]"
                    />
                    <span className="text-sm">
                      Adresse de facturation par défaut
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary text-sm flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-sm flex-1 gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving
                      ? "Enregistrement..."
                      : editingId
                        ? "Modifier"
                        : "Ajouter"}
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
