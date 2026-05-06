"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import type { AccountProfile } from "@/lib/queries/account";
import { updatePassword, updateProfile } from "./actions";

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

export function ProfilForm({ profile }: { profile: AccountProfile }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [profileSaved, setProfileSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatarUrl ?? null,
  );
  const [isAvatarPending, startAvatarTransition] = useTransition();

  const initials = (
    (profile.firstName ?? profile.email).charAt(0) +
    (profile.lastName?.charAt(0) ?? "")
  ).toUpperCase();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email,
      phone: profile.phone ?? "",
      birthDate: profile.birthDate ?? "",
      newsletter: profile.newsletterOptin,
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSave = (data: ProfileFormData) => {
    startProfileTransition(async () => {
      const res = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        birthDate: data.birthDate || null,
        avatarUrl,
        newsletter: data.newsletter,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Profil mis à jour");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    });
  };

  const persistAvatar = (next: string | null) => {
    setAvatarUrl(next);
    // L'avatar a sa propre persistance pour ne pas dépendre du bouton
    // "Enregistrer" du formulaire principal — sinon on perdrait le fichier
    // déjà uploadé dans Storage si l'utilisateur quitte sans enregistrer.
    startAvatarTransition(async () => {
      const res = await updateProfile({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        phone: profile.phone,
        birthDate: profile.birthDate,
        avatarUrl: next,
        newsletter: profile.newsletterOptin,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
      }
    });
  };

  const onChangePassword = (data: PasswordFormData) => {
    startPasswordTransition(async () => {
      const res = await updatePassword(data.newPassword);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Mot de passe mis à jour");
      resetPwd();
    });
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
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-beige-nude flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-display font-semibold text-terracotta">
                    {initials}
                  </span>
                )}
              </div>
              {isAvatarPending && (
                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {[profile.firstName, profile.lastName]
                  .filter(Boolean)
                  .join(" ") || "Mon compte"}
              </p>
              <p className="text-sm text-muted mt-0.5 mb-3">{profile.email}</p>
              <div className="max-w-xs">
                <SingleImageUploader
                  value={avatarUrl}
                  onChange={persistAvatar}
                  folder="avatars"
                  aspect="square"
                  cropTo={{ width: 256, height: 256 }}
                  disabled={isAvatarPending}
                  hint="Recadrée auto en 256×256 (carré)."
                />
              </div>
            </div>
          </div>
        </motion.div>

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
              <label className="block text-sm font-medium mb-1.5">Prénom</label>
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
              <label className="block text-sm font-medium mb-1.5">Nom</label>
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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5">
              Adresse e-mail
            </label>
            <input
              {...register("email")}
              disabled
              className={cn(
                inputClass,
                "bg-muted-soft text-muted cursor-not-allowed",
              )}
            />
            <p className="text-xs text-muted mt-1">
              L&apos;adresse e-mail ne peut pas être modifiée depuis cette page
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
                  errors.phone && "border-destructive",
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
              <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-terracotta peer-focus:ring-2 peer-focus:ring-terracotta/30 transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          <button
            type="submit"
            disabled={isProfilePending}
            className="btn-primary gap-2"
          >
            {isProfilePending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : profileSaved ? (
              <>
                <Check className="w-4 h-4" />
                Enregistré
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </motion.form>

        <motion.form
          variants={staggerItem}
          onSubmit={handleSubmitPwd(onChangePassword)}
          className="bg-white rounded-xl border border-border p-6"
        >
          <h2 className="font-display text-lg font-semibold mb-6">
            Modifier le mot de passe
          </h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...registerPwd("newPassword")}
                  className={cn(
                    inputClass,
                    pwdErrors.newPassword && "border-destructive",
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
                type={showPassword ? "text" : "password"}
                {...registerPwd("confirmPassword")}
                className={cn(
                  inputClass,
                  pwdErrors.confirmPassword && "border-destructive",
                )}
              />
              {pwdErrors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {pwdErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPasswordPending}
            className="btn-secondary gap-2"
          >
            {isPasswordPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Modification...
              </>
            ) : (
              "Modifier le mot de passe"
            )}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
