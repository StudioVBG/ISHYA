"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth/error-messages";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-ember" /></div>}>
      <ConnexionContent />
    </Suspense>
  );
}

function ConnexionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect_to");
  const errorCode = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  useEffect(() => {
    if (errorCode === "account_disabled") {
      toast.error(
        "Votre compte a été désactivé. Contactez le support pour plus d'informations.",
      );
    } else if (errorCode === "auth_callback_failed") {
      toast.error("Échec de la connexion. Veuillez réessayer.");
    }
  }, [errorCode]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(data: LoginFormData) {
    const supabase = createClient();
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(translateAuthError(error));
      return;
    }

    toast.success("Connexion réussie !");
    try {
      await fetch("/api/cart/merge", { method: "POST" });
    } catch {
      // ignore — cart merge is non-blocking
    }

    let target = explicitRedirect;
    const isDefaultTarget = !target || target === "/compte";
    if (isDefaultTarget && signInData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user.id)
        .maybeSingle();
      if (profile?.role === "admin") {
        target = "/admin";
      } else if (!target) {
        target = "/compte";
      }
    }
    router.push(target ?? "/compte");
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "apple") {
    setIsOAuthLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(explicitRedirect ?? "/compte")}`,
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
          Bon retour parmi nous
        </h2>
        <p className="mt-2 text-steel text-sm">
          Connectez-vous pour retrouver vos favoris et commandes
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
            "hover:border-ink/30 hover:bg-ink/[0.03]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isOAuthLoading === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
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
            "text-sm font-medium text-bone transition-all duration-200",
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
          <span className="bg-background px-4 text-xs uppercase tracking-widest text-steel">
            ou
          </span>
        </div>
      </motion.div>

      {/* Login form */}
      <motion.form
        variants={staggerItem}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {/* Email field */}
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-steel">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder=" "
            className={cn(
              "peer w-full rounded-lg border bg-transparent px-10 pb-2.5 pt-5 text-sm outline-none transition-colors",
              "focus:border-ember focus:ring-1 focus:ring-ember/30",
              errors.email
                ? "border-destructive"
                : "border-border"
            )}
            {...register("email")}
          />
          <label
            htmlFor="email"
            className={cn(
              "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-steel transition-all duration-200",
              "peer-focus:top-3 peer-focus:text-xs peer-focus:text-ember",
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

        {/* Password field */}
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-steel">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder=" "
            className={cn(
              "peer w-full rounded-lg border bg-transparent px-10 pb-2.5 pt-5 text-sm outline-none transition-colors",
              "focus:border-ember focus:ring-1 focus:ring-ember/30",
              errors.password
                ? "border-destructive"
                : "border-border"
            )}
            {...register("password")}
          />
          <label
            htmlFor="password"
            className={cn(
              "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-steel transition-all duration-200",
              "peer-focus:top-3 peer-focus:text-xs peer-focus:text-ember",
              "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs",
              errors.password && "text-destructive peer-focus:text-destructive"
            )}
          >
            Mot de passe
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          {errors.password && (
            <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me + forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-ember accent-ember focus:ring-ember/30"
              {...register("rememberMe")}
            />
            <span className="text-sm text-steel">Se souvenir de moi</span>
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-sm text-ember hover:text-ember-dark transition-colors"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Connexion en cours…
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </motion.form>

      {/* Register link */}
      <motion.p
        variants={staggerItem}
        className="mt-8 text-center text-sm text-steel"
      >
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="font-medium text-foreground hover:text-ember transition-colors"
        >
          Créer un compte
        </Link>
      </motion.p>
    </motion.div>
  );
}
