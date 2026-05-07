import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Confirmation de l'inscription — ISHYA",
  robots: { index: false, follow: false },
};

type Status = "ok" | "invalid" | "already";

function isValidStatus(value: string | undefined): value is Status {
  return value === "ok" || value === "invalid" || value === "already";
}

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status: Status = isValidStatus(params.status) ? params.status : "invalid";

  const config = {
    ok: {
      icon: <Sparkles className="w-12 h-12 text-terracotta" />,
      title: "C'est confirmé !",
      message:
        "Votre inscription à la newsletter ISHYA est validée. Vous allez recevoir votre code -10 % par email.",
    },
    already: {
      icon: <CheckCircle2 className="w-12 h-12 text-success" />,
      title: "Déjà confirmé",
      message:
        "Cette adresse est déjà inscrite à notre newsletter. Pas d'action supplémentaire.",
    },
    invalid: {
      icon: <AlertCircle className="w-12 h-12 text-destructive" />,
      title: "Lien invalide ou expiré",
      message:
        "Ce lien de confirmation n'est plus valide. Inscrivez-vous à nouveau pour recevoir un nouvel email.",
    },
  }[status];

  return (
    <main className="py-20 px-4">
      <div className="container max-w-lg mx-auto text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-beige-nude-light flex items-center justify-center">
          {config.icon}
        </div>
        <h1 className="font-display text-3xl mb-4 text-foreground">
          {config.title}
        </h1>
        <p className="text-muted leading-relaxed mb-8">{config.message}</p>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
        >
          Découvrir la boutique
        </Link>
      </div>
    </main>
  );
}
