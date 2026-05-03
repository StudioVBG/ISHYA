"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { fadeInUp, scaleIn } from "@/lib/animations";

type AuthMode = "guest" | "login" | "register";

const emailSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "Prénom requis (2 caractères min.)"),
  lastName: z.string().min(2, "Nom requis (2 caractères min.)"),
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type GuestForm = z.infer<typeof emailSchema>;
type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const AUTH_OPTIONS: { mode: AuthMode; icon: React.ElementType; label: string; desc: string }[] = [
  {
    mode: "guest",
    icon: Mail,
    label: "Commander en tant qu'invité",
    desc: "Pas besoin de créer un compte",
  },
  {
    mode: "login",
    icon: User,
    label: "J'ai déjà un compte",
    desc: "Connectez-vous pour un checkout rapide",
  },
  {
    mode: "register",
    icon: UserPlus,
    label: "Créer un compte",
    desc: "Suivez vos commandes et gagnez des points",
  },
];

export default function IdentificationPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<AuthMode>("guest");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const guestForm = useForm<GuestForm>();
  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  async function onGuestSubmit(data: GuestForm) {
    setIsLoading(true);
    try {
      if (!emailSchema.safeParse(data).success) return;
      sessionStorage.setItem("checkout_email", data.email);
      router.push("/checkout/livraison");
    } finally {
      setIsLoading(false);
    }
  }

  async function onLoginSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      if (!loginSchema.safeParse(data).success) return;
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        if (error.message.includes("Invalid login")) {
          toast.error("Email ou mot de passe incorrect");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Veuillez confirmer votre email avant de vous connecter");
        } else {
          toast.error("Erreur de connexion. Veuillez réessayer.");
        }
        return;
      }
      sessionStorage.setItem("checkout_email", data.email);
      router.push("/checkout/livraison");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function onRegisterSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      if (!registerSchema.safeParse(data).success) return;
      const supabase = createClient();
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Un compte existe déjà avec cet email");
        } else {
          toast.error("Erreur lors de la création du compte");
        }
        return;
      }

      // Renseigner le profil (le trigger Supabase peut déjà l'avoir créé)
      if (signUpData.user) {
        await supabase.from("profiles").upsert(
          {
            id: signUpData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
          },
          { onConflict: "id" },
        );
      }

      sessionStorage.setItem("checkout_email", data.email);
      router.push("/checkout/livraison");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white transition-colors";

  return (
    <div className="container py-8 lg:py-12">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-2xl lg:text-3xl mb-2">
            Identification
          </h1>
          <p className="text-muted text-sm">
            Comment souhaitez-vous continuer ?
          </p>
        </motion.div>

        {/* Mode selector */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="space-y-3 mb-8"
        >
          {AUTH_OPTIONS.map(({ mode, icon: Icon, label, desc }) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                activeMode === mode
                  ? "border-terracotta bg-terracotta/5 shadow-sm"
                  : "border-border bg-white hover:border-muted-light"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  activeMode === mode
                    ? "bg-terracotta text-white"
                    : "bg-beige-nude-light text-muted"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "text-sm font-medium block",
                    activeMode === mode && "text-terracotta"
                  )}
                >
                  {label}
                </span>
                <span className="text-xs text-muted">{desc}</span>
              </div>
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  activeMode === mode
                    ? "border-terracotta"
                    : "border-muted-light"
                )}
              >
                {activeMode === mode && (
                  <motion.div
                    layoutId="auth-indicator"
                    className="w-2.5 h-2.5 rounded-full bg-terracotta"
                  />
                )}
              </div>
            </button>
          ))}
        </motion.div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {activeMode === "guest" && (
            <motion.form
              key="guest"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
              onSubmit={guestForm.handleSubmit(onGuestSubmit)}
              className="bg-white rounded-xl border border-border p-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="guest-email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="guest-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    className={cn(inputClasses, "pl-10")}
                    {...guestForm.register("email", {
                      required: "Email requis",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Adresse email invalide",
                      },
                    })}
                  />
                </div>
                {guestForm.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {guestForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full group"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Chargement...
                  </span>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          )}

          {activeMode === "login" && (
            <motion.form
              key="login"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="bg-white rounded-xl border border-border p-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    className={cn(inputClasses, "pl-10")}
                    {...loginForm.register("email", {
                      required: "Email requis",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Adresse email invalide",
                      },
                    })}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium mb-1.5"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(inputClasses, "pl-10 pr-10")}
                    {...loginForm.register("password", {
                      required: "Mot de passe requis",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full group"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted">
                <a
                  href="/mot-de-passe-oublie"
                  className="hover:text-terracotta transition-colors"
                >
                  Mot de passe oublié ?
                </a>
              </p>
            </motion.form>
          )}

          {activeMode === "register" && (
            <motion.form
              key="register"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="bg-white rounded-xl border border-border p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reg-first"
                    className="block text-sm font-medium mb-1.5"
                  >
                    Prénom
                  </label>
                  <input
                    id="reg-first"
                    type="text"
                    placeholder="Marie"
                    className={inputClasses}
                    {...registerForm.register("firstName", {
                      required: "Prénom requis",
                      minLength: { value: 2, message: "2 caractères min." },
                    })}
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="text-xs text-destructive mt-1">
                      {registerForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="reg-last"
                    className="block text-sm font-medium mb-1.5"
                  >
                    Nom
                  </label>
                  <input
                    id="reg-last"
                    type="text"
                    placeholder="Dupont"
                    className={inputClasses}
                    {...registerForm.register("lastName", {
                      required: "Nom requis",
                      minLength: { value: 2, message: "2 caractères min." },
                    })}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="text-xs text-destructive mt-1">
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    className={cn(inputClasses, "pl-10")}
                    {...registerForm.register("email", {
                      required: "Email requis",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Adresse email invalide",
                      },
                    })}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium mb-1.5"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8 caractères minimum"
                    className={cn(inputClasses, "pl-10 pr-10")}
                    {...registerForm.register("password", {
                      required: "Mot de passe requis",
                      minLength: {
                        value: 8,
                        message: "8 caractères minimum",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full group"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création...
                  </span>
                ) : (
                  <>
                    Créer et continuer
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
