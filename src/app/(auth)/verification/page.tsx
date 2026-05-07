"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function VerificationPage() {
  const [isResending, setIsResending] = useState(false);

  async function handleResend() {
    setIsResending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      toast.error("Impossible de trouver votre email. Veuillez vous reconnecter.");
      setIsResending(false);
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Erreur lors du renvoi. Veuillez réessayer dans quelques minutes.");
    } else {
      toast.success("Email de vérification renvoyé !");
    }
    setIsResending(false);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="text-center"
    >
      <motion.div variants={staggerItem}>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-terracotta/10">
          <Mail className="h-10 w-10 text-terracotta" />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <h2 className="mt-8 font-display text-3xl sm:text-4xl text-foreground">
          Vérifiez votre email
        </h2>
        <p className="mt-4 text-muted text-sm leading-relaxed max-w-sm mx-auto">
          Un email de vérification a été envoyé à votre adresse.
          Cliquez sur le lien dans l&apos;email pour activer votre compte.
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="mt-3">
        <p className="text-xs text-muted-light">
          Vous ne trouvez pas l&apos;email ? Vérifiez votre dossier spam.
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="mt-8 space-y-3">
        <button
          type="button"
          disabled={isResending}
          onClick={handleResend}
          className="btn-primary"
        >
          {isResending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Renvoyer l&apos;email
            </>
          )}
        </button>

        <div>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
