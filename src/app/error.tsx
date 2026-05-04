"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center py-20 px-4 bg-beige-nude-light/30">
      <div className="container max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-8">
          <AlertTriangle className="w-9 h-9 text-destructive" />
        </div>
        <p className="text-destructive uppercase tracking-[0.2em] text-xs font-medium mb-3">
          Une erreur est survenue
        </p>
        <h1 className="font-display text-4xl md:text-5xl mb-6">
          Quelque chose s&apos;est cassé
        </h1>
        <p className="text-muted leading-relaxed mb-10 max-w-md mx-auto">
          Nous sommes désolés pour la gêne occasionnée. Notre équipe a été
          informée. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="text-xs text-muted/70 mb-6 font-mono">
            Référence : {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
