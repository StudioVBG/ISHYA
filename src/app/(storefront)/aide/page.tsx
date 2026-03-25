"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CreditCard,
  Truck,
  RotateCcw,
  Ruler,
  Sparkles,
  User,
  ChevronDown,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const categories = [
  {
    slug: "commandes-paiement",
    title: "Commandes & Paiement",
    icon: CreditCard,
    desc: "Modes de paiement, suivi de commande, facturation",
  },
  {
    slug: "livraison-suivi",
    title: "Livraison & Suivi",
    icon: Truck,
    desc: "Délais, transporteurs, suivi en temps réel",
  },
  {
    slug: "retours-echanges",
    title: "Retours & Échanges",
    icon: RotateCcw,
    desc: "Politique de retour, remboursements, échanges",
  },
  {
    slug: "tailles-mesures",
    title: "Tailles & Mesures",
    icon: Ruler,
    desc: "Guide des tailles, ajustements, conseils",
  },
  {
    slug: "entretien-bijoux",
    title: "Entretien Bijoux",
    icon: Sparkles,
    desc: "Nettoyage, conservation, précautions",
  },
  {
    slug: "mon-compte",
    title: "Mon Compte",
    icon: User,
    desc: "Inscription, connexion, données personnelles",
  },
];

const popularQuestions = [
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "La livraison standard (Colissimo) est effectuée sous 3 à 5 jours ouvrés en France métropolitaine. La livraison express (Chronopost) permet de recevoir votre commande sous 1 à 2 jours ouvrés. La livraison en Point Relais (Mondial Relay) prend 4 à 6 jours ouvrés.",
  },
  {
    question: "Comment entretenir mes bijoux en fleurs séchées ?",
    answer:
      "Vos bijoux ISHYA sont protégés par une résine de haute qualité, mais quelques précautions prolongeront leur beauté : évitez le contact avec l'eau, les parfums et les produits chimiques. Rangez-les à l'abri de la lumière directe du soleil. Nettoyez-les délicatement avec un chiffon doux et sec.",
  },
  {
    question: "Puis-je retourner un article ?",
    answer:
      "Oui, vous disposez de 14 jours après réception pour retourner un article dans son état d'origine, non porté et dans son emballage d'origine. Les boucles d'oreilles ne sont pas reprises pour des raisons d'hygiène, sauf défaut de fabrication. Les articles personnalisés ne sont pas éligibles au retour.",
  },
  {
    question: "Quels modes de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal et Apple Pay. Tous les paiements sont sécurisés par un cryptage SSL 256 bits. Vous pouvez également payer en 3 fois sans frais à partir de 80€ d'achat.",
  },
  {
    question: "La livraison est-elle offerte ?",
    answer:
      "Oui ! La livraison standard est offerte pour toute commande supérieure ou égale à 60€ en France métropolitaine. En dessous de ce montant, la livraison standard est facturée 4,90€.",
  },
];

function Accordion({
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

export default function AidePage() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter(
    (cat) =>
      !search ||
      cat.title.toLowerCase().includes(search.toLowerCase()) ||
      cat.desc.toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuestions = popularQuestions.filter(
    (q) =>
      !search ||
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase())
  );

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
              <HelpCircle className="w-3.5 h-3.5" />
              Support
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Centre d&apos;aide
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted mb-8">
              Trouvez rapidement des réponses à vos questions sur nos bijoux, la
              livraison, les retours et plus encore.
            </motion.p>

            {/* Search */}
            <motion.div variants={fadeInUp} className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="container max-w-5xl mx-auto space-y-20">
          {/* Categories */}
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
              Comment pouvons-nous vous aider ?
            </motion.h2>
            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredCategories.map((cat) => (
                <motion.div key={cat.slug} variants={staggerItem}>
                  <Link
                    href={`/aide/${cat.slug}`}
                    className="group block bg-white border border-border rounded-2xl p-6 hover:border-terracotta/40 hover:shadow-lg hover:shadow-terracotta/5 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-terracotta/20 transition-colors">
                      <cat.icon className="w-5 h-5 text-terracotta" />
                    </div>
                    <h3 className="font-medium mb-1 group-hover:text-terracotta transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-muted">{cat.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs text-terracotta font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir les questions
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Popular Questions */}
          {filteredQuestions.length > 0 && (
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
                Questions fréquentes
              </motion.h2>
              <motion.div variants={staggerContainer} className="space-y-3 max-w-3xl mx-auto">
                {filteredQuestions.map((q, i) => (
                  <motion.div key={i} variants={staggerItem}>
                    <Accordion question={q.question} answer={q.answer} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {/* Contact CTA */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-beige-nude-light/50 rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl mb-3">
              Vous n&apos;avez pas trouvé votre réponse ?
            </h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Notre équipe est disponible du lundi au vendredi de 9h à 18h pour
              répondre à toutes vos questions.
            </p>
            <Link href="/contact" className="btn-primary">
              Nous contacter
            </Link>
          </motion.section>
        </div>
      </div>
    </>
  );
}
