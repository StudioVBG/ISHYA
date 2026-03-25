"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  CreditCard,
  Truck,
  RotateCcw,
  Ruler,
  Sparkles,
  User,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

type FaqItem = { question: string; answer: string };

const faqData: Record<
  string,
  { title: string; icon: typeof CreditCard; questions: FaqItem[] }
> = {
  "commandes-paiement": {
    title: "Commandes & Paiement",
    icon: CreditCard,
    questions: [
      {
        question: "Quels modes de paiement acceptez-vous ?",
        answer:
          "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal et Apple Pay. Tous les paiements sont sécurisés via un protocole SSL 256 bits. Vos informations bancaires ne sont jamais stockées sur nos serveurs.",
      },
      {
        question: "Puis-je payer en plusieurs fois ?",
        answer:
          "Oui, nous proposons le paiement en 3 fois sans frais à partir de 80€ d'achat. Cette option est disponible au moment du paiement. Les échéances sont automatiquement prélevées sur votre carte bancaire.",
      },
      {
        question: "Comment puis-je suivre ma commande ?",
        answer:
          "Dès l'expédition de votre commande, vous recevez un email de confirmation avec un numéro de suivi. Vous pouvez également suivre votre commande depuis votre espace client ou sur notre page de suivi en renseignant votre numéro de commande et votre email.",
      },
      {
        question: "Puis-je modifier ou annuler ma commande ?",
        answer:
          "Vous pouvez modifier ou annuler votre commande dans les 2 heures suivant sa validation, à condition qu'elle n'ait pas encore été préparée. Contactez-nous rapidement par email à contact@ishya.fr en précisant votre numéro de commande.",
      },
      {
        question: "Comment obtenir une facture ?",
        answer:
          "Une facture est automatiquement générée et envoyée par email lors de la confirmation de votre commande. Vous pouvez également la télécharger depuis votre espace client, dans la rubrique « Mes commandes ». Si vous avez besoin d'une facture spécifique, contactez-nous.",
      },
      {
        question: "Mon paiement a été refusé, que faire ?",
        answer:
          "Si votre paiement a été refusé, vérifiez que vos informations bancaires sont correctes et que votre carte n'a pas expiré. Assurez-vous que le plafond de paiement de votre carte n'est pas atteint. Si le problème persiste, contactez votre banque ou essayez un autre moyen de paiement.",
      },
    ],
  },
  "livraison-suivi": {
    title: "Livraison & Suivi",
    icon: Truck,
    questions: [
      {
        question: "Quels sont les délais de livraison ?",
        answer:
          "Livraison standard (Colissimo) : 3 à 5 jours ouvrés en France métropolitaine. Livraison express (Chronopost) : 1 à 2 jours ouvrés. Point Relais (Mondial Relay) : 4 à 6 jours ouvrés. Les commandes passées avant 14h (jours ouvrés) sont expédiées le jour même.",
      },
      {
        question: "Combien coûte la livraison ?",
        answer:
          "Standard : 4,90€ (offerte dès 60€). Express : 9,90€. Point Relais : 3,90€. DOM-TOM : 12,90€ (7-15 jours). Europe : 8,90€ (5-10 jours). Tous nos envois sont soigneusement emballés dans un écrin ISHYA.",
      },
      {
        question: "Livrez-vous à l'international ?",
        answer:
          "Oui, nous livrons dans toute l'Union Européenne ainsi que dans les DOM-TOM. Les délais varient selon la destination : 5 à 10 jours ouvrés pour l'Europe et 7 à 15 jours pour les DOM-TOM. Des frais de douane peuvent s'appliquer pour certaines destinations.",
      },
      {
        question: "Mon colis est en retard, que faire ?",
        answer:
          "Si votre colis dépasse le délai de livraison estimé, vérifiez d'abord le suivi en ligne avec le numéro fourni par email. En cas de retard significatif (plus de 3 jours au-delà du délai estimé), contactez-nous et nous ouvrirons une enquête auprès du transporteur.",
      },
      {
        question: "Puis-je modifier l'adresse de livraison ?",
        answer:
          "Vous pouvez modifier l'adresse de livraison tant que votre commande n'a pas été expédiée. Contactez-nous le plus rapidement possible par email à contact@ishya.fr. Une fois le colis expédié, la modification n'est plus possible.",
      },
    ],
  },
  "retours-echanges": {
    title: "Retours & Échanges",
    icon: RotateCcw,
    questions: [
      {
        question: "Quelle est votre politique de retour ?",
        answer:
          "Vous disposez de 14 jours calendaires à compter de la réception de votre commande pour retourner un article. Le produit doit être dans son état d'origine, non porté, et dans son emballage d'origine. Les frais de retour sont à la charge du client sauf en cas de défaut.",
      },
      {
        question: "Comment initier un retour ?",
        answer:
          "Connectez-vous à votre espace client, accédez à « Mes commandes », sélectionnez la commande concernée et cliquez sur « Demander un retour ». Vous pouvez aussi nous envoyer un email à contact@ishya.fr avec votre numéro de commande et le motif du retour.",
      },
      {
        question: "Quels articles ne sont pas éligibles au retour ?",
        answer:
          "Pour des raisons d'hygiène, les boucles d'oreilles ne sont pas reprises sauf en cas de défaut de fabrication. Les articles personnalisés ou gravés ne peuvent pas être retournés. Les articles soldés ou achetés en promotion sont échangeables mais non remboursables.",
      },
      {
        question: "Sous quel délai suis-je remboursé(e) ?",
        answer:
          "Le remboursement est effectué dans les 14 jours suivant la réception et la vérification de votre retour. Le remboursement s'effectue sur le même moyen de paiement que celui utilisé lors de la commande. Un email de confirmation vous est envoyé dès le traitement.",
      },
      {
        question: "Puis-je échanger un article ?",
        answer:
          "Oui, vous pouvez échanger un article contre un autre modèle ou une autre taille. Contactez-nous pour organiser l'échange. Si l'article souhaité est d'un montant supérieur, la différence vous sera facturée. Si inférieur, nous vous remboursons la différence.",
      },
    ],
  },
  "tailles-mesures": {
    title: "Tailles & Mesures",
    icon: Ruler,
    questions: [
      {
        question: "Comment connaître ma taille de bague ?",
        answer:
          "Enroulez un fil ou une fine bande de papier autour de votre doigt. Marquez le point où le fil se rejoint et mesurez la longueur obtenue en millimètres. Cette mesure correspond à la circonférence de votre doigt. Consultez notre guide des tailles pour trouver votre correspondance.",
      },
      {
        question: "Quelle longueur de collier choisir ?",
        answer:
          "Ras-de-cou (35-38 cm) : épouse le cou, idéal avec un décolleté. Princesse (40-45 cm) : la longueur classique. Matinée (50-55 cm) : sous la clavicule, parfait sur un pull. Opéra (60-70 cm) : élégant en sautoir. En cas de doute, la longueur Princesse est un choix sûr.",
      },
      {
        question: "Les bijoux sont-ils ajustables ?",
        answer:
          "Certains de nos bracelets sont ajustables grâce à une chaîne d'extension de 3 cm. Nos bagues sont disponibles dans des tailles fixes. Si vous hésitez entre deux tailles, nous vous conseillons de choisir la taille supérieure.",
      },
      {
        question: "Où trouver le guide des tailles complet ?",
        answer:
          "Notre guide des tailles complet est disponible sur la page dédiée de notre site. Vous y trouverez des tableaux de correspondance pour les bagues, les colliers et les bracelets, ainsi que des astuces pour mesurer facilement chez vous.",
      },
      {
        question: "Puis-je faire ajuster un bijou après achat ?",
        answer:
          "Nos bijoux en résine contenant des fleurs séchées ne peuvent malheureusement pas être redimensionnés après fabrication. C'est pourquoi nous vous recommandons de consulter attentivement notre guide des tailles avant de commander.",
      },
    ],
  },
  "entretien-bijoux": {
    title: "Entretien Bijoux",
    icon: Sparkles,
    questions: [
      {
        question: "Comment entretenir mes bijoux en fleurs séchées ?",
        answer:
          "Vos bijoux ISHYA sont protégés par une résine de haute qualité, mais quelques précautions prolongeront leur beauté : évitez le contact prolongé avec l'eau, retirez vos bijoux avant la douche ou le bain. Évitez les parfums, crèmes et produits chimiques en contact direct.",
      },
      {
        question: "Puis-je porter mes bijoux sous la douche ?",
        answer:
          "Nous déconseillons fortement de porter vos bijoux sous la douche. Bien que la résine soit résistante, l'eau chaude et les produits de soin peuvent à long terme altérer la brillance de la résine et endommager les parties métalliques.",
      },
      {
        question: "Comment ranger mes bijoux ?",
        answer:
          "Rangez vos bijoux à l'abri de la lumière directe du soleil, qui pourrait altérer les couleurs des fleurs séchées au fil du temps. Utilisez l'écrin ISHYA fourni ou une boîte à bijoux doublée de tissu doux. Évitez de les empiler pour prévenir les rayures.",
      },
      {
        question: "Comment nettoyer mes bijoux ISHYA ?",
        answer:
          "Essuyez délicatement vos bijoux avec un chiffon doux et sec après chaque utilisation. Si nécessaire, utilisez un chiffon très légèrement humide, puis séchez immédiatement. N'utilisez jamais de produits chimiques, d'alcool ou de nettoyants abrasifs.",
      },
      {
        question: "Les fleurs séchées changent-elles de couleur avec le temps ?",
        answer:
          "La résine protège remarquablement bien les fleurs, mais une exposition prolongée au soleil direct peut légèrement estomper les couleurs naturelles au fil des années. En suivant nos conseils de rangement, vos bijoux conserveront leur éclat pendant de très nombreuses années.",
      },
    ],
  },
  "mon-compte": {
    title: "Mon Compte",
    icon: User,
    questions: [
      {
        question: "Comment créer un compte ?",
        answer:
          "Cliquez sur l'icône « Mon compte » en haut de la page, puis sur « Créer un compte ». Renseignez votre nom, votre adresse email et choisissez un mot de passe. Vous recevrez un email de confirmation pour valider votre inscription.",
      },
      {
        question: "J'ai oublié mon mot de passe, que faire ?",
        answer:
          "Sur la page de connexion, cliquez sur « Mot de passe oublié ? ». Saisissez votre adresse email et nous vous enverrons un lien de réinitialisation. Ce lien est valable 24 heures. Si vous ne recevez pas l'email, vérifiez votre dossier spam.",
      },
      {
        question: "Comment modifier mes informations personnelles ?",
        answer:
          "Connectez-vous à votre espace client et accédez à « Mon profil ». Vous pourrez modifier votre nom, adresse email, numéro de téléphone et adresses de livraison. N'oubliez pas de sauvegarder vos modifications.",
      },
      {
        question: "Comment supprimer mon compte ?",
        answer:
          "Conformément au RGPD, vous pouvez demander la suppression de votre compte et de vos données personnelles à tout moment. Envoyez-nous un email à contact@ishya.fr depuis l'adresse associée à votre compte. La suppression sera effective sous 30 jours.",
      },
      {
        question: "Puis-je commander sans créer de compte ?",
        answer:
          "Oui, vous pouvez passer commande en tant qu'invité(e). Vous devrez simplement renseigner votre adresse email et vos informations de livraison. Cependant, créer un compte vous permet de suivre vos commandes, enregistrer vos adresses et accéder à votre historique.",
      },
    ],
  },
};

const relatedCategories: Record<string, string[]> = {
  "commandes-paiement": ["livraison-suivi", "retours-echanges"],
  "livraison-suivi": ["commandes-paiement", "retours-echanges"],
  "retours-echanges": ["commandes-paiement", "livraison-suivi"],
  "tailles-mesures": ["entretien-bijoux", "commandes-paiement"],
  "entretien-bijoux": ["tailles-mesures", "retours-echanges"],
  "mon-compte": ["commandes-paiement", "livraison-suivi"],
};

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-beige-nude-light/30 transition-colors"
      >
        <span className="font-medium pr-4">{item.question}</span>
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
            <div className="px-5 pb-5 border-t border-border pt-4">
              <p className="text-sm text-muted leading-relaxed mb-4">
                {item.answer}
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <span className="text-xs text-muted">
                  Cette réponse vous a-t-elle été utile ?
                </span>
                <button
                  onClick={() => setFeedback("up")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    feedback === "up"
                      ? "bg-success/10 text-success"
                      : "hover:bg-beige-nude-light text-muted"
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFeedback("down")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    feedback === "down"
                      ? "bg-destructive/10 text-destructive"
                      : "hover:bg-beige-nude-light text-muted"
                  )}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                {feedback && (
                  <span className="text-xs text-success ml-1">
                    Merci pour votre retour !
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AideDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = faqData[slug];

  if (!category) {
    return (
      <div className="py-32 text-center">
        <h1 className="font-display text-3xl mb-4">Catégorie introuvable</h1>
        <Link href="/aide" className="btn-primary">
          Retour au centre d&apos;aide
        </Link>
      </div>
    );
  }

  const Icon = category.icon;
  const related = (relatedCategories[slug] || [])
    .map((s) => (faqData[s] ? { slug: s, ...faqData[s] } : null))
    .filter(Boolean) as Array<{ slug: string; title: string; icon: typeof CreditCard; questions: FaqItem[] }>;

  return (
    <>
      {/* Breadcrumb + Hero */}
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Breadcrumb */}
            <motion.nav
              variants={fadeInUp}
              className="flex items-center gap-2 text-sm text-muted mb-8"
            >
              <Link
                href="/aide"
                className="hover:text-terracotta transition-colors"
              >
                Aide
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">
                {category.title}
              </span>
            </motion.nav>

            <motion.div variants={fadeInUp} className="flex items-center gap-4">
              <div className="w-14 h-14 bg-terracotta/10 rounded-2xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-terracotta" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl">
                  {category.title}
                </h1>
                <p className="text-muted text-sm mt-1">
                  {category.questions.length} questions
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="container max-w-3xl mx-auto">
          {/* FAQ list */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-3 mb-16"
          >
            {category.questions.map((q, i) => (
              <motion.div key={i} variants={staggerItem}>
                <FaqAccordion item={q} />
              </motion.div>
            ))}
          </motion.div>

          {/* Related */}
          {related.length > 0 && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={fadeInUp}
                className="font-display text-xl md:text-2xl mb-6"
              >
                Articles connexes
              </motion.h2>
              <motion.div
                variants={staggerContainer}
                className="grid sm:grid-cols-2 gap-4"
              >
                {related.map((cat) => {
                  const RelIcon = cat.icon;
                  return (
                    <motion.div key={cat.slug} variants={staggerItem}>
                      <Link
                        href={`/aide/${cat.slug}`}
                        className="group flex items-center gap-4 bg-white border border-border rounded-xl p-5 hover:border-terracotta/40 transition-all"
                      >
                        <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center shrink-0">
                          <RelIcon className="w-4 h-4 text-terracotta" />
                        </div>
                        <div>
                          <p className="font-medium text-sm group-hover:text-terracotta transition-colors">
                            {cat.title}
                          </p>
                          <p className="text-xs text-muted">
                            {cat.questions.length} questions
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.section>
          )}

          {/* Back */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <Link
              href="/aide"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-terracotta transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au centre d&apos;aide
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
