"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/animations";

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function MotDePasseOubliePage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotFormData) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setSentEmail(data.email);
    setIsSuccess(true);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.div variants={staggerItem}>
              <Link
                href="/connexion"
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>

              <h2 className="font-display text-3xl sm:text-4xl text-foreground">
                Mot de passe oublié
              </h2>
              <p className="mt-3 text-muted text-sm leading-relaxed">
                Entrez votre email, nous vous enverrons un lien de
                réinitialisation
              </p>
            </motion.div>

            <motion.form
              variants={staggerItem}
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-5"
              noValidate
            >
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
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.email.message}
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
                    Envoi en cours…
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </button>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10">
              <CheckCircle2 className="h-8 w-8 text-terracotta" />
            </div>

            <h2 className="mt-6 font-display text-2xl sm:text-3xl text-foreground">
              Email envoyé !
            </h2>
            <p className="mt-3 text-muted text-sm leading-relaxed">
              Si un compte existe avec l&apos;adresse{" "}
              <span className="font-medium text-foreground">{sentEmail}</span>,
              vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <p className="mt-2 text-muted text-xs">
              Pensez à vérifier vos spams si vous ne voyez pas l&apos;email.
            </p>

            <Link
              href="/connexion"
              className={cn(
                "mt-8 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3",
                "text-sm font-medium text-foreground transition-all duration-200",
                "hover:border-terracotta hover:text-terracotta"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
