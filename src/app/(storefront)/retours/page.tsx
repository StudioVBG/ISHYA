"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  ClipboardCheck,
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const timeline = [
  {
    icon: ClipboardCheck,
    title: "Demande",
    subtitle: "14 jours",
    desc: "Faites votre demande de retour en ligne ou par email dans les 14 jours suivant la réception.",
  },
  {
    icon: CheckCircle2,
    title: "Approbation",
    subtitle: "24-48h",
    desc: "Notre équipe vérifie votre demande et vous envoie les instructions de retour.",
  },
  {
    icon: Package,
    title: "Envoi",
    subtitle: "Emballage soigné",
    desc: "Renvoyez l'article dans son emballage d'origine, non porté et en parfait état.",
  },
  {
    icon: Truck,
    title: "Réception",
    subtitle: "Contrôle qualité",
    desc: "Nous réceptionnons et vérifions l'état de l'article retourné.",
  },
  {
    icon: CreditCard,
    title: "Remboursement",
    subtitle: "Sous 14 jours",
    desc: "Remboursement effectué sur le moyen de paiement original.",
  },
];

const conditions = [
  "L'article doit être retourné dans les 14 jours calendaires suivant la réception",
  "Le produit doit être dans son état d'origine, non porté et non endommagé",
  "L'emballage d'origine doit être conservé et en bon état",
  "L'écrin ISHYA et tous les accessoires doivent être inclus",
  "Les frais de retour sont à la charge du client (sauf défaut de fabrication)",
];

const exceptions = [
  {
    title: "Boucles d'oreilles",
    reason: "Non reprises pour des raisons d'hygiène, sauf défaut de fabrication.",
  },
  {
    title: "Articles personnalisés",
    reason:
      "Les bijoux gravés ou fabriqués sur mesure ne sont ni repris ni échangés.",
  },
  {
    title: "Articles en promotion",
    reason:
      "Échangeables contre un avoir mais non remboursables, sauf défaut de conformité.",
  },
];

const faq = [
  {
    question: "Comment initier un retour ?",
    answer:
      "Connectez-vous à votre espace client, rendez-vous dans « Mes commandes », sélectionnez la commande concernée et cliquez sur « Demander un retour ». Vous recevrez un email avec les instructions et l'adresse de retour. Vous pouvez aussi nous contacter directement à contact@ishya.fr.",
  },
  {
    question: "Combien de temps pour être remboursé(e) ?",
    answer:
      "Le remboursement est effectué dans un délai maximum de 14 jours après réception et vérification de l'article retourné. Le remboursement s'effectue automatiquement sur le moyen de paiement utilisé lors de la commande. Un email de confirmation vous est envoyé.",
  },
  {
    question: "Puis-je échanger plutôt que me faire rembourser ?",
    answer:
      "Oui ! Vous pouvez échanger votre article contre un autre modèle ou une autre taille. Si le nouvel article est plus cher, la différence vous sera facturée. S'il est moins cher, nous vous remboursons la différence. Contactez-nous pour organiser l'échange.",
  },
  {
    question: "Qui paie les frais de retour ?",
    answer:
      "Les frais de retour sont à la charge du client dans le cas d'une rétractation simple. En cas de défaut de fabrication ou d'erreur de notre part, ISHYA prend en charge les frais de retour et vous envoie une étiquette prépayée.",
  },
];

function ReturnFaq({
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

export default function RetoursPage() {
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
              <RotateCcw className="w-3.5 h-3.5" />
              Retours
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Politique de retour
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted">
              Votre satisfaction est notre priorité. Découvrez comment
              retourner ou échanger un article simplement.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="container max-w-5xl mx-auto space-y-20">
          {/* Timeline */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl text-center mb-12"
            >
              Le processus de retour
            </motion.h2>
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              {timeline.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    variants={staggerItem}
                    className="relative text-center"
                  >
                    <div className="w-14 h-14 bg-terracotta/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-terracotta" />
                    </div>
                    <h3 className="font-medium text-sm mb-0.5">
                      {step.title}
                    </h3>
                    <p className="text-xs text-terracotta font-medium mb-2">
                      {step.subtitle}
                    </p>
                    <p className="text-xs text-muted leading-relaxed hidden md:block">
                      {step.desc}
                    </p>
                    {i < timeline.length - 1 && (
                      <div className="hidden md:block absolute top-7 -right-2 translate-x-1/2">
                        <ArrowRight className="w-4 h-4 text-border" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* Conditions */}
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
              Conditions de retour
            </motion.h2>
            <motion.div
              variants={staggerContainer}
              className="bg-white border border-border rounded-2xl p-6 md:p-8"
            >
              <ul className="space-y-4">
                {conditions.map((c, i) => (
                  <motion.li
                    key={i}
                    variants={staggerItem}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-muted">{c}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.section>

          {/* Exceptions */}
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
              Exceptions
            </motion.h2>
            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-3 gap-4"
            >
              {exceptions.map((exc) => (
                <motion.div
                  key={exc.title}
                  variants={staggerItem}
                  className="bg-warning-soft/50 border border-warning/30/50 rounded-xl p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <h3 className="font-medium text-sm">{exc.title}</h3>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {exc.reason}
                  </p>
                </motion.div>
              ))}
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
                  <ReturnFaq question={q.question} answer={q.answer} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-beige-nude-light/50 rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl mb-3">
              Besoin d&apos;effectuer un retour ?
            </h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Connectez-vous à votre espace client ou contactez-nous pour
              initier votre demande de retour.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="btn-primary gap-2">
                Initier un retour
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/aide" className="btn-secondary">
                En savoir plus
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
