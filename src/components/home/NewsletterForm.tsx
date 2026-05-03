"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <motion.form
      variants={fadeInUp}
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col sm:flex-row gap-3"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse email"
        className="flex-1 px-5 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-terracotta transition-colors"
      />
      <button
        type="submit"
        className="btn-primary px-8 py-3.5 whitespace-nowrap"
      >
        S&apos;inscrire
      </button>
    </motion.form>
  );
}
