"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fadeInUp } from "@/lib/animations";
import { subscribeNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Veuillez renseigner votre adresse email.");
      return;
    }
    startTransition(async () => {
      const res = await subscribeNewsletter({ email: trimmed, source: "home" });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message);
      setEmail("");
    });
  }

  return (
    <motion.form
      variants={fadeInUp}
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse email"
        required
        aria-label="Adresse email"
        className="flex-1 px-5 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-terracotta transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary px-8 py-3.5 whitespace-nowrap"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Inscription…
          </>
        ) : (
          "S'inscrire"
        )}
      </button>
    </motion.form>
  );
}
