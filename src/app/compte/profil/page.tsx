"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Camera,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const profileSchema = z.object({
  firstName: z.string().min(2, "Minimum 2 caractères"),
  lastName: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, "Numéro invalide")
    .or(z.literal("")),
  birthDate: z.string().optional(),
  newsletter: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Requis"),
    newPassword: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(1, "Requis"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie.dupont@email.com",
      phone: "06 12 34 56 78",
      birthDate: "1992-05-14",
      newsletter: true,
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSave = async (_data: ProfileFormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onChangePassword = async (_data: PasswordFormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all";

  return (
    <div>
      <motion.h1
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="font-display text-2xl sm:text-3xl font-semibold mb-8"
      >
        Mon profil
      </motion.h1>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Avatar */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-beige-nude flex items-center justify-center overflow-hidden">
                <span className="text-2xl font-display font-semibold text-terracotta">
                  MD
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-dark transition-colors shadow-md">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="font-medium">Photo de profil</p>
              <p className="text-sm text-muted mt-0.5">
                JPG, PNG ou GIF. 2 Mo max.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile form */}
        <motion.form
          variants={staggerItem}
          onSubmit={handleSubmit(onSave)}
          className="bg-white rounded-xl border border-border p-6"
        >
          <h2 className="font-display text-lg font-semibold mb-6">
            Informations personnelles
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
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
              {errors.firstName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Nom</label>
              <input
                {...register("lastName")}
                className={cn(
                  inputClass,
                  errors.lastName && "border-destructive"
                )}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5">
              Adresse e-mail
            </label>
            <input
              {...register("email")}
              disabled
              className={cn(inputClass, "bg-gray-50 text-muted cursor-not-allowed")}
            />
            <p className="text-xs text-muted mt-1">
              L&apos;adresse e-mail ne peut pas être modifiée
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Téléphone
              </label>
              <input
                {...register("phone")}
                placeholder="+33 6 12 34 56 78"
                className={cn(
                  inputClass,
                  errors.phone && "border-destructive"
                )}
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Date de naissance
              </label>
              <input
                type="date"
                {...register("birthDate")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex items-center justify-between p-4 bg-beige-nude-light/50 rounded-lg mb-6">
            <div>
              <p className="text-sm font-medium">Newsletter ISHYA</p>
              <p className="text-xs text-muted mt-0.5">
                Recevez nos nouveautés et offres exclusives
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("newsletter")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-terracotta peer-focus:ring-2 peer-focus:ring-terracotta/30 transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saved ? "Enregistré !" : "Enregistrer les modifications"}
          </button>
        </motion.form>

        {/* Change password */}
        <motion.form
          variants={staggerItem}
          onSubmit={handleSubmitPwd(onChangePassword)}
          className="bg-white rounded-xl border border-border p-6"
        >
          <h2 className="font-display text-lg font-semibold mb-6">
            Changer mon mot de passe
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...registerPwd("currentPassword")}
                  className={cn(
                    inputClass,
                    "pr-10",
                    pwdErrors.currentPassword && "border-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                {...registerPwd("newPassword")}
                className={cn(
                  inputClass,
                  pwdErrors.newPassword && "border-destructive"
                )}
              />
              {pwdErrors.newPassword && (
                <p className="text-xs text-destructive mt-1">
                  {pwdErrors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                {...registerPwd("confirmPassword")}
                className={cn(
                  inputClass,
                  pwdErrors.confirmPassword && "border-destructive"
                )}
              />
              {pwdErrors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {pwdErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <button type="submit" className="btn-secondary mt-6">
            Changer le mot de passe
          </button>
        </motion.form>

        {/* Danger zone */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-destructive/20 p-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-lg font-semibold text-destructive">
                Zone de danger
              </h2>
              <p className="text-sm text-muted mt-1 mb-4">
                Conformément au RGPD, vous pouvez demander la suppression de
                votre compte et de toutes vos données personnelles. Cette action
                est irréversible.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5 transition-colors"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  Confirmer la suppression
                </h3>
              </div>
              <p className="text-sm text-muted mb-6">
                Êtes-vous sûr(e) de vouloir supprimer votre compte ? Toutes vos
                données seront définitivement effacées, y compris vos commandes,
                favoris et points de fidélité. Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary text-sm"
                >
                  Annuler
                </button>
                <button className="px-4 py-2.5 bg-destructive text-white text-sm font-medium rounded-lg hover:bg-destructive/90 transition-colors">
                  Supprimer définitivement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
