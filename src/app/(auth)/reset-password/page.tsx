"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z
      .string()
      .min(1, "La confirmation est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function getPasswordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Faible" };
  if (score <= 2) return { score: 2, label: "Moyen" };
  if (score <= 3) return { score: 3, label: "Bon" };
  return { score: 4, label: "Excellent" };
}

const strengthColors: Record<number, string> = {
  1: "bg-destructive",
  2: "bg-amber-400",
  3: "bg-lime-500",
  4: "bg-success",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");
  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordValue || ""),
    [passwordValue]
  );

  async function onSubmit(data: ResetFormData) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      if (error.message.includes("same password")) {
        toast.error("Le nouveau mot de passe doit être différent de l'ancien");
      } else {
        toast.error("Erreur lors de la réinitialisation. Veuillez réessayer.");
      }
      return;
    }

    toast.success("Mot de passe réinitialisé avec succès !");
    router.push("/connexion");
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/10">
          <ShieldCheck className="h-7 w-7 text-terracotta" />
        </div>

        <h2 className="mt-6 font-display text-3xl sm:text-4xl text-foreground">
          Nouveau mot de passe
        </h2>
        <p className="mt-2 text-muted text-sm">
          Choisissez un mot de passe sécurisé pour votre compte
        </p>
      </motion.div>

      <motion.form
        variants={staggerItem}
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-5"
        noValidate
      >
        {/* New password */}
        <div>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder=" "
              className={cn(
                "peer w-full rounded-lg border bg-transparent px-10 pb-2.5 pt-5 text-sm outline-none transition-colors",
                "focus:border-terracotta focus:ring-1 focus:ring-terracotta/30",
                errors.password ? "border-destructive" : "border-border"
              )}
              {...register("password")}
            />
            <label
              htmlFor="password"
              className={cn(
                "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted transition-all duration-200",
                "peer-focus:top-3 peer-focus:text-xs peer-focus:text-terracotta",
                "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs",
                errors.password && "text-destructive peer-focus:text-destructive"
              )}
            >
              Nouveau mot de passe
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}

          {/* Strength meter */}
          {passwordValue && passwordValue.length > 0 && (
            <div className="mt-2.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      level <= passwordStrength.score
                        ? strengthColors[passwordStrength.score]
                        : "bg-border"
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted">
                Force :{" "}
                <span
                  className={cn(
                    "font-medium",
                    passwordStrength.score <= 1 && "text-destructive",
                    passwordStrength.score === 2 && "text-amber-500",
                    passwordStrength.score === 3 && "text-lime-600",
                    passwordStrength.score === 4 && "text-success"
                  )}
                >
                  {passwordStrength.label}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder=" "
            className={cn(
              "peer w-full rounded-lg border bg-transparent px-10 pb-2.5 pt-5 text-sm outline-none transition-colors",
              "focus:border-terracotta focus:ring-1 focus:ring-terracotta/30",
              errors.confirmPassword ? "border-destructive" : "border-border"
            )}
            {...register("confirmPassword")}
          />
          <label
            htmlFor="confirmPassword"
            className={cn(
              "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted transition-all duration-200",
              "peer-focus:top-3 peer-focus:text-xs peer-focus:text-terracotta",
              "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs",
              errors.confirmPassword && "text-destructive peer-focus:text-destructive"
            )}
          >
            Confirmer le mot de passe
          </label>
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta px-4 py-3.5",
            "text-sm font-medium text-white transition-all duration-200",
            "hover:bg-terracotta-dark hover:scale-[1.01]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Réinitialisation en cours…
            </>
          ) : (
            "Réinitialiser"
          )}
        </button>
      </motion.form>
    </motion.div>
  );
}
