"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  acceptTerms: z.literal(true, {
    error: "Vous devez accepter les CGV",
  }),
  newsletter: z.boolean().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

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
  2: "bg-warning",
  3: "bg-lime-500",
  4: "bg-success",
};

export default function InscriptionPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
      acceptTerms: undefined as unknown as true,
      newsletter: false,
    },
  });

  const passwordValue = watch("password");
  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordValue || ""),
    [passwordValue]
  );

  async function onSubmit(data: RegisterFormData) {
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Cet email est déjà utilisé. Essayez de vous connecter.");
      } else {
        toast.error("Erreur lors de la création du compte. Veuillez réessayer.");
      }
      return;
    }

    if (authData.user) {
      await supabase
        .from("profiles")
        .update({ first_name: data.firstName })
        .eq("id", authData.user.id);
    }

    toast.success("Compte créé ! Vérifiez votre email pour l'activer.");
    router.push("/verification");
  }

  async function handleOAuth(provider: "google" | "apple") {
    setIsOAuthLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=/compte`,
      },
    });
    if (error) {
      toast.error("Erreur de connexion. Veuillez réessayer.");
      setIsOAuthLoading(null);
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem}>
        <h2 className="font-display text-3xl sm:text-4xl text-foreground">
          Créez votre compte
        </h2>
        <p className="mt-2 text-muted text-sm">
          Rejoignez l&apos;univers ISHYA et profitez d&apos;avantages exclusifs
        </p>
      </motion.div>

      {/* OAuth buttons */}
      <motion.div variants={staggerItem} className="mt-8 space-y-3">
        <button
          type="button"
          disabled={isOAuthLoading !== null}
          onClick={() => handleOAuth("google")}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-lg border border-border px-4 py-3",
            "text-sm font-medium text-foreground transition-all duration-200",
            "hover:border-foreground/30 hover:bg-foreground/[0.02]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isOAuthLoading === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continuer avec Google
        </button>

        <button
          type="button"
          disabled={isOAuthLoading !== null}
          onClick={() => handleOAuth("apple")}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-lg bg-black px-4 py-3",
            "text-sm font-medium text-white transition-all duration-200",
            "hover:bg-black/90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isOAuthLoading === "apple" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          )}
          Continuer avec Apple
        </button>
      </motion.div>

      {/* Separator */}
      <motion.div variants={staggerItem} className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs uppercase tracking-widest text-muted">
            ou
          </span>
        </div>
      </motion.div>

      {/* Register form */}
      <motion.form
        variants={staggerItem}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {/* First name */}
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <User className="h-4 w-4" />
          </div>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder=" "
            className={cn(
              "peer w-full rounded-lg border bg-transparent px-10 pb-2.5 pt-5 text-sm outline-none transition-colors",
              "focus:border-terracotta focus:ring-1 focus:ring-terracotta/30",
              errors.firstName ? "border-destructive" : "border-border"
            )}
            {...register("firstName")}
          />
          <label
            htmlFor="firstName"
            className={cn(
              "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted transition-all duration-200",
              "peer-focus:top-3 peer-focus:text-xs peer-focus:text-terracotta",
              "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs",
              errors.firstName && "text-destructive peer-focus:text-destructive"
            )}
          >
            Prénom
          </label>
          {errors.firstName && (
            <p className="mt-1.5 text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder=" "
            className={cn(
              "peer w-full rounded-lg border bg-transparent px-10 pb-2.5 pt-5 text-sm outline-none transition-colors",
              "focus:border-terracotta focus:ring-1 focus:ring-terracotta/30",
              errors.email ? "border-destructive" : "border-border"
            )}
            {...register("email")}
          />
          <label
            htmlFor="email"
            className={cn(
              "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted transition-all duration-200",
              "peer-focus:top-3 peer-focus:text-xs peer-focus:text-terracotta",
              "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs",
              errors.email && "text-destructive peer-focus:text-destructive"
            )}
          >
            Email
          </label>
          {errors.email && (
            <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password with strength meter */}
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
              Mot de passe
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
            <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
          )}

          {/* Password strength meter */}
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
                Force du mot de passe :{" "}
                <span
                  className={cn(
                    "font-medium",
                    passwordStrength.score <= 1 && "text-destructive",
                    passwordStrength.score === 2 && "text-warning",
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

        {/* Accept terms */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border text-terracotta accent-terracotta focus:ring-terracotta/30"
              {...register("acceptTerms")}
            />
            <span className="text-sm text-muted leading-snug">
              J&apos;accepte les{" "}
              <Link href="/cgv" className="text-foreground underline underline-offset-2 hover:text-terracotta transition-colors">
                CGV
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" className="text-foreground underline underline-offset-2 hover:text-terracotta transition-colors">
                politique de confidentialité
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1.5 text-xs text-destructive">{errors.acceptTerms.message}</p>
          )}
        </div>

        {/* Newsletter opt-in */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border text-terracotta accent-terracotta focus:ring-terracotta/30"
            {...register("newsletter")}
          />
          <span className="text-sm text-muted leading-snug">
            Recevoir les offres et nouveautés par email
          </span>
        </label>

        {/* Submit button */}
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
              Création en cours…
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>
      </motion.form>

      {/* Login link */}
      <motion.p
        variants={staggerItem}
        className="mt-8 text-center text-sm text-muted"
      >
        Déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="font-medium text-foreground hover:text-terracotta transition-colors"
        >
          Se connecter
        </Link>
      </motion.p>
    </motion.div>
  );
}
