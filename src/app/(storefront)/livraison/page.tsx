"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Zap,
  MapPin,
  Gift,
  ChevronDown,
  Package,
  Globe,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const shippingMethods = [
  {
    icon: Truck,
    name: "Standard",
    carrier: "Colissimo",
    delay: "3-5 jours ouvrés",
    price: "4,90 €",
    freeAbove: "Offerte dès 60 €",
    color: "bg-terracotta/10 text-terracotta",
  },
  {
    icon: Zap,
    name: "Express",
    carrier: "Chronopost",
    delay: "1-2 jours ouvrés",
    price: "9,90 €",
    freeAbove: null,
    color: "bg-gold/10 text-gold-dark",
  },
  {
    icon: MapPin,
    name: "Point Relais",
    carrier: "Mondial Relay",
    delay: "4-6 jours ouvrés",
    price: "3,90 €",
    freeAbove: null,
    color: "bg-success/10 text-success",
  },
];

const zones = [
  {
    zone: "France métropolitaine",
    delay: "3-5 jours",
    price: "4,90 €",
    note: "Offerte dès 60 €",
  },
  {
    zone: "DOM-TOM",
    delay: "7-15 jours",
    price: "12,90 €",
    note: "Droits de douane possibles",
  },
  {
    zone: "Union Européenne",
    delay: "5-10 jours",
    price: "8,90 €",
    note: "Suivi inclus",
  },
];

const faq = [
  {
    question: "Comment suivre ma commande ?",
    answer:
      "Dès l'expédition de votre commande, vous recevez un email contenant votre numéro de suivi. Vous pouvez suivre votre colis directement sur notre page de suivi en renseignant votre numéro de commande et votre email, ou sur le site du transporteur (Colissimo, Chronopost ou Mondial Relay).",
  },
  {
    question: "Que faire si mon colis est endommagé à la réception ?",
    answer:
      "Si votre colis présente des signes de détérioration à la réception, nous vous conseillons d'émettre des réserves auprès du livreur et de nous contacter dans les 48 heures avec des photos du colis et de l'article. Nous procéderons à un remplacement ou un remboursement.",
  },
  {
    question: "Puis-je modifier mon adresse de livraison après la commande ?",
    answer:
      "Vous pouvez modifier l'adresse de livraison tant que votre commande n'a pas été expédiée. Contactez-nous rapidement par email à contact@ishya.fr en précisant votre numéro de commande et la nouvelle adresse. Une fois le colis expédié, la modification n'est plus possible.",
  },
  {
    question: "Livrez-vous le samedi ?",
    answer:
      "La livraison Colissimo peut avoir lieu du lundi au samedi (hors jours fériés). Chronopost livre du lundi au vendredi uniquement. Pour les Points Relais Mondial Relay, les horaires de retrait dépendent de chaque point relais.",
  },
  {
    question: "Comment fonctionne la livraison offerte ?",
    answer:
      "La livraison standard (Colissimo) est automatiquement offerte pour toute commande d'un montant supérieur ou égal à 60 € en France métropolitaine. La réduction s'applique automatiquement dans votre panier. Les modes express et Point Relais ne sont pas concernés par cette offre.",
  },
];

function ShippingFaq({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-beige-nude-light/30 transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted shrink-0 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-muted leading-relaxed border-t border-border pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LivraisonPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-beige-nude-light/50 py-16 md:py-24 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <Truck className="w-3.5 h-3.5" />
              Livraison
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Livraison
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted">
              Découvrez nos options de livraison et recevez vos bijoux ISHYA
              en toute sérénité.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="container max-w-5xl mx-auto space-y-20">
          {/* Free shipping banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-terracotta to-terracotta-dark text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-6"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Gift className="w-7 h-7" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="font-display text-xl md:text-2xl mb-1">
                Livraison offerte dès 60 € d&apos;achat
              </h2>
              <p className="text-white/80 text-sm">
                Profitez de la livraison standard gratuite en France
                métropolitaine pour toute commande de 60 € ou plus.
              </p>
            </div>
          </motion.div>

          {/* Shipping methods */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl text-center mb-10"
            >
              Nos modes de livraison
            </motion.h2>
            <motion.div
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-6"
            >
              {shippingMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={method.name}
                    variants={staggerItem}
                    className="bg-white border border-border rounded-2xl p-6 text-center hover:border-terracotta/30 hover:shadow-lg hover:shadow-terracotta/5 transition-all"
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4",
                        method.color
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg mb-1">
                      {method.name}
                    </h3>
                    <p className="text-xs text-muted mb-4">
                      {method.carrier}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Délai</span>
                        <span className="font-medium">{method.delay}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Tarif</span>
                        <span className="font-medium">{method.price}</span>
                      </div>
                    </div>
                    {method.freeAbove && (
                      <div className="mt-4 bg-success/10 text-success text-xs font-medium px-3 py-1.5 rounded-full">
                        {method.freeAbove}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* Zones */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-gold" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl">
                Zones de livraison
              </h2>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="overflow-x-auto rounded-2xl border border-border"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-beige-nude-light/50">
                    <th className="text-left py-4 px-6 font-medium">Zone</th>
                    <th className="text-left py-4 px-6 font-medium">Délai</th>
                    <th className="text-left py-4 px-6 font-medium">
                      Tarif standard
                    </th>
                    <th className="text-left py-4 px-6 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((z, i) => (
                    <tr
                      key={z.zone}
                      className={cn(
                        "border-t border-border",
                        i % 2 === 0 && "bg-white"
                      )}
                    >
                      <td className="py-4 px-6 font-medium">{z.zone}</td>
                      <td className="py-4 px-6 text-muted">{z.delay}</td>
                      <td className="py-4 px-6 text-muted">{z.price}</td>
                      <td className="py-4 px-6">
                        <span className="text-xs bg-beige-nude-light px-2 py-1 rounded-full">
                          {z.note}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.section>

          {/* Suivi en temps réel */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="bg-white border border-border rounded-2xl p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-terracotta" />
                  <h2 className="font-display text-2xl">
                    Suivi en temps réel
                  </h2>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Dès l&apos;expédition de votre commande, un email contenant
                  votre numéro de suivi vous est envoyé. Vous pouvez suivre
                  l&apos;acheminement de votre colis à chaque étape, de notre
                  atelier jusqu&apos;à votre porte.
                </p>
                <a
                  href="/suivi"
                  className="text-sm text-terracotta font-medium hover:underline inline-flex items-center gap-1"
                >
                  Suivre ma commande
                  <Package className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="bg-beige-nude-light/50 rounded-xl p-6 space-y-3">
                {[
                  { label: "Commande confirmée", done: true },
                  { label: "En préparation", done: true },
                  { label: "Expédiée", done: true },
                  { label: "En transit", done: false },
                  { label: "Livrée", done: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        s.done ? "bg-terracotta" : "bg-border"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        s.done ? "font-medium" : "text-muted"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.section>

          {/* FAQ */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl mb-8"
            >
              Questions fréquentes
            </motion.h2>
            <motion.div variants={staggerContainer} className="space-y-3">
              {faq.map((q, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <ShippingFaq question={q.question} answer={q.answer} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
