"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DesinscriptionForm() {
  const params = useSearchParams();
  const presetEmail = params.get("email") ?? "";

  const [email, setEmail] = useState(presetEmail);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (presetEmail) setEmail(presetEmail);
  }, [presetEmail]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      // TODO: brancher l'endpoint Resend / Supabase de désinscription.
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Vous êtes désinscrit(e) de la newsletter.");
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-terracotta/10 mb-4">
          <CheckCircle2 className="w-7 h-7 text-terracotta" />
        </div>
        <h2 className="font-display text-2xl mb-2">C&apos;est fait</h2>
        <p className="text-sm text-muted leading-relaxed">
          L&apos;adresse <strong>{email}</strong> a été retirée de notre
          newsletter. Vous pouvez vous réinscrire à tout moment depuis le pied
          de page.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-border rounded-2xl p-6 sm:p-8 space-y-5"
    >
      <div>
        <label className="block text-xs font-medium text-foreground mb-2 uppercase tracking-wider">
          Votre adresse email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-2 uppercase tracking-wider">
          Raison <span className="text-muted normal-case">(facultatif)</span>
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta bg-white"
        >
          <option value="">— Sélectionner —</option>
          <option value="too-many">Trop d&apos;emails</option>
          <option value="not-relevant">Contenu peu pertinent</option>
          <option value="never-subscribed">Je ne me suis jamais inscrit(e)</option>
          <option value="other">Autre</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full inline-flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : null}
        Confirmer la désinscription
      </button>
    </form>
  );
}
