"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import {
  createCardSetupIntent,
  deleteSavedCard,
  setDefaultCard,
  type SavedCard,
} from "./actions";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const BRAND_LABELS: Record<string, string> = {
  visa: "VISA",
  mastercard: "MasterCard",
  amex: "Amex",
  discover: "Discover",
  jcb: "JCB",
  diners: "Diners",
  unionpay: "UnionPay",
  unknown: "Carte",
};

function CardForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    setIsProcessing(false);

    if (confirmError) {
      setError(
        confirmError.message ?? "Une erreur est survenue lors de l'enregistrement.",
      );
      return;
    }

    toast.success("Carte enregistrée");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: { billingDetails: { address: { country: "FR" } } },
        }}
      />
      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="btn-primary w-full gap-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Enregistrer la carte
          </>
        )}
      </button>
    </form>
  );
}

export function PaiementView({
  initialCards,
  initialError,
}: {
  initialCards: SavedCard[];
  initialError?: string;
}) {
  const [cards, setCards] = useState<SavedCard[]>(initialCards);
  const [showAdd, setShowAdd] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingSetup, startCreateSetup] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stripeConfigured = !!stripePromise;

  const openAddCard = () => {
    setShowAdd(true);
    startCreateSetup(async () => {
      const res = await createCardSetupIntent();
      if (!res.ok || !res.clientSecret) {
        toast.error(res.error ?? "Erreur");
        setShowAdd(false);
        return;
      }
      setClientSecret(res.clientSecret);
    });
  };

  const handleAddSuccess = async () => {
    setShowAdd(false);
    setClientSecret(null);
    // Recharger via la page (revalidate)
    window.location.reload();
  };

  const handleDelete = (card: SavedCard) => {
    if (
      !window.confirm(
        `Supprimer la carte ${card.brand} •••• ${card.last4} ?`,
      )
    )
      return;
    setPendingId(card.id);
    startTransition(async () => {
      const res = await deleteSavedCard(card.id);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Carte supprimée");
      setCards((prev) => prev.filter((c) => c.id !== card.id));
    });
  };

  const handleSetDefault = (card: SavedCard) => {
    setPendingId(card.id);
    startTransition(async () => {
      const res = await setDefaultCard(card.id);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur");
        return;
      }
      toast.success("Carte définie par défaut");
      setCards((prev) =>
        prev.map((c) => ({ ...c, isDefault: c.id === card.id })),
      );
    });
  };

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-1">
            Moyens de paiement
          </h1>
          <p className="text-sm text-muted">
            Gérez vos cartes bancaires enregistrées via Stripe.
          </p>
        </div>
        {stripeConfigured && (
          <button onClick={openAddCard} className="btn-primary text-sm gap-2">
            <Plus className="w-4 h-4" />
            Ajouter une carte
          </button>
        )}
      </motion.div>

      {!stripeConfigured && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-900 mb-6"
        >
          Stripe n&apos;est pas configuré sur cette installation. Les cartes ne
          peuvent pas être enregistrées.
        </motion.div>
      )}

      {initialError && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-sm text-destructive mb-6"
        >
          {initialError}
        </motion.div>
      )}

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-terracotta" />
              Nouvelle carte
            </h2>
            <button
              onClick={() => {
                setShowAdd(false);
                setClientSecret(null);
              }}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {isCreatingSetup || !clientSecret ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-terracotta" />
            </div>
          ) : stripePromise && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#DF887B",
                    fontFamily: "'DM Sans', sans-serif",
                    borderRadius: "8px",
                  },
                },
                locale: "fr",
              }}
            >
              <CardForm onSuccess={handleAddSuccess} />
            </Elements>
          ) : null}
        </motion.div>
      )}

      {cards.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-border p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-beige-nude-light flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-terracotta" />
          </div>
          <h2 className="font-display text-lg mb-2">
            Aucune carte enregistrée
          </h2>
          <p className="text-sm text-muted">
            Ajoutez une carte pour accélérer vos prochaines commandes.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {cards.map((card) => {
            const isLoading = isPending && pendingId === card.id;
            return (
              <motion.div
                key={card.id}
                variants={staggerItem}
                className={cn(
                  "bg-white rounded-xl border p-5 flex items-center gap-4",
                  card.isDefault
                    ? "border-terracotta ring-1 ring-terracotta/30"
                    : "border-border",
                )}
              >
                <div className="w-12 h-8 rounded bg-gradient-to-br from-foreground to-gray-700 flex items-center justify-center text-white text-[10px] font-bold tracking-wider">
                  {card.brand
                    ? (BRAND_LABELS[card.brand.toLowerCase()] ?? card.brand.toUpperCase())
                    : "CB"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      •••• •••• •••• {card.last4 ?? "••••"}
                    </p>
                    {card.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs text-terracotta font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Expire le{" "}
                    {String(card.expMonth ?? 0).padStart(2, "0")}/
                    {String(card.expYear ?? 0).slice(-2)}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefault(card)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs text-terracotta hover:bg-terracotta/5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Définir par défaut
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(card)}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label="Supprimer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mt-8 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3"
      >
        <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-900">
          Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs.
          Elles sont gérées de façon sécurisée par notre prestataire de paiement
          Stripe (certifié PCI-DSS niveau 1).
        </p>
      </motion.div>
    </div>
  );
}
