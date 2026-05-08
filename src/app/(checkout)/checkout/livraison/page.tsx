"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Truck,
  Zap,
  Package,
  Gift,
  ArrowLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/stores/cart-store";
import { cn, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

const addressSchema = z.object({
  firstName: z.string().min(2, "Prénom requis (2 caractères min.)"),
  lastName: z.string().min(2, "Nom requis (2 caractères min.)"),
  line1: z.string().min(5, "Adresse requise"),
  line2: z.string().optional(),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  city: z.string().min(2, "Ville requise"),
  country: z.string().min(2, "Pays requis"),
  phone: z
    .string()
    .regex(
      /^(\+33|0)\d{9}$/,
      "Numéro invalide (ex: 0612345678 ou +33612345678)"
    ),
});

type AddressForm = z.infer<typeof addressSchema>;

interface ShippingMethod {
  id: string;
  label: string;
  description: string;
  price: number;
  delay: string;
  icon: React.ElementType;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Colissimo suivi",
    price: 4.9,
    delay: "3-5 jours ouvrés",
    icon: Truck,
  },
  {
    id: "express",
    label: "Express",
    description: "Chronopost 24h",
    price: 9.9,
    delay: "1-2 jours ouvrés",
    icon: Zap,
  },
  {
    id: "relay",
    label: "Point Relais",
    description: "Mondial Relay",
    price: 3.9,
    delay: "4-6 jours ouvrés",
    icon: Package,
  },
];

export default function LivraisonPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const giftWrap = useCartStore((s) => s.giftWrap);
  const setGiftWrap = useCartStore((s) => s.setGiftWrap);
  const discountAmount = useCartStore((s) => s.discountAmount);

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [isLoading, setIsLoading] = useState(false);

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "France" },
  });

  const shippingCost = freeShipping
    ? 0
    : SHIPPING_METHODS.find((m) => m.id === selectedShipping)?.price ?? 4.9;
  const giftWrapCost = giftWrap ? 3 : 0;
  const total = subtotal - discountAmount + shippingCost + giftWrapCost;

  async function onSubmit(data: AddressForm) {
    setIsLoading(true);
    try {
      sessionStorage.setItem("checkout_address", JSON.stringify(data));
      sessionStorage.setItem("checkout_shipping_method", selectedShipping);
      sessionStorage.setItem("checkout_shipping_cost", shippingCost.toString());
      router.push("/checkout/paiement");
    } finally {
      setIsLoading(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember bg-bone-soft transition-colors";

  return (
    <div className="container py-8 lg:py-12">
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
        {/* Left – Form */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-2xl lg:text-3xl mb-1">
              Adresse de livraison
            </h1>
            <p className="text-sm text-steel">
              Où souhaitez-vous recevoir votre commande ?
            </p>
          </motion.div>

          <motion.form
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Address Fields */}
            <div className="bg-bone-soft rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-ember" />
                <h2 className="font-display text-base">Adresse</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                    Prénom <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Marie"
                    className={inputClasses}
                    {...register("firstName", {
                      required: "Prénom requis",
                      minLength: { value: 2, message: "2 caractères min." },
                    })}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                    Nom <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Dupont"
                    className={inputClasses}
                    {...register("lastName", {
                      required: "Nom requis",
                      minLength: { value: 2, message: "2 caractères min." },
                    })}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="line1" className="block text-sm font-medium mb-1.5">
                  Adresse <span className="text-destructive">*</span>
                </label>
                <input
                  id="line1"
                  type="text"
                  placeholder="12 rue des Fleurs"
                  className={inputClasses}
                  {...register("line1", {
                    required: "Adresse requise",
                    minLength: { value: 5, message: "Adresse trop courte" },
                  })}
                />
                {errors.line1 && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.line1.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="line2" className="block text-sm font-medium mb-1.5">
                  Complément d&apos;adresse
                </label>
                <input
                  id="line2"
                  type="text"
                  placeholder="Appartement, bâtiment, étage…"
                  className={inputClasses}
                  {...register("line2")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium mb-1.5">
                    Code postal <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    placeholder="75001"
                    maxLength={5}
                    className={inputClasses}
                    {...register("postalCode", {
                      required: "Code postal requis",
                      pattern: {
                        value: /^\d{5}$/,
                        message: "5 chiffres requis",
                      },
                    })}
                  />
                  {errors.postalCode && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1.5">
                    Ville <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Paris"
                    className={inputClasses}
                    {...register("city", {
                      required: "Ville requise",
                      minLength: { value: 2, message: "Nom de ville trop court" },
                    })}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-1.5">
                    Pays <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="country"
                    className={inputClasses}
                    {...register("country", { required: "Pays requis" })}
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                    Téléphone <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    className={inputClasses}
                    {...register("phone", {
                      required: "Téléphone requis",
                      pattern: {
                        value: /^(\+33|0)\d{9}$/,
                        message: "Format: 0612345678",
                      },
                    })}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="bg-bone-soft rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-ember" />
                <h2 className="font-display text-base">Mode de livraison</h2>
              </div>

              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const isFree = freeShipping && method.id === "standard";
                  const Icon = method.icon;

                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        selectedShipping === method.id
                          ? "border-ember bg-ember/5"
                          : "border-border hover:border-muted-light"
                      )}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={selectedShipping === method.id}
                        onChange={() => setSelectedShipping(method.id)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          selectedShipping === method.id
                            ? "bg-ember text-bone"
                            : "bg-bone-soft text-steel"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {method.label}
                          </span>
                          {isFree && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide bg-success/10 text-success px-2 py-0.5 rounded-full">
                              Offerte !
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-steel">
                          {method.description} — {method.delay}
                        </span>
                      </div>
                      <span className="text-sm font-medium shrink-0">
                        {isFree ? (
                          <span className="text-success">Gratuit</span>
                        ) : (
                          formatPrice(method.price)
                        )}
                      </span>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          selectedShipping === method.id
                            ? "border-ember"
                            : "border-muted-light"
                        )}
                      >
                        {selectedShipping === method.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-ember" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Gift Wrap */}
            <div className="bg-bone-soft rounded-xl border border-border p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-ember focus:ring-ember accent-ember"
                />
                <Gift className="w-4 h-4 text-ember" />
                <span className="text-sm font-medium">
                  Emballage cadeau (+3,00 €)
                </span>
              </label>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push("/checkout/identification")}
                className="btn-secondary text-sm group"
              >
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                Retour
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary text-sm group"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Chargement...
                  </span>
                ) : (
                  <>
                    Continuer vers le paiement
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>

        {/* Right – Order Summary */}
        <div className="lg:sticky lg:top-32 h-fit">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="bg-bone-soft rounded-xl border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-lg">Votre commande</h2>
            </div>

            {/* Items */}
            <div className="p-6 space-y-3 border-b border-border max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-bone-soft shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-ember text-bone text-[10px] font-medium rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.name}</p>
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-6 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-steel">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Remise</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              {giftWrap && (
                <div className="flex justify-between text-sm">
                  <span className="text-steel">Emballage cadeau</span>
                  <span>{formatPrice(giftWrapCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-steel">Livraison</span>
                <span className={cn(shippingCost === 0 && "text-success font-medium")}>
                  {shippingCost === 0
                    ? "Offerte"
                    : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="border-t border-border pt-2.5 mt-2.5">
                <div className="flex justify-between">
                  <span className="font-display text-lg">Total</span>
                  <span className="font-display text-lg font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-steel">
            <Shield className="w-3.5 h-3.5" />
            <span>Données protégées & paiement sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
