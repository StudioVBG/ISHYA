"use client";

import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const toc = [
  { id: "objet", label: "Article 1 – Objet" },
  { id: "produits", label: "Article 2 – Produits" },
  { id: "prix", label: "Article 3 – Prix" },
  { id: "commandes", label: "Article 4 – Commandes" },
  { id: "paiement", label: "Article 5 – Paiement" },
  { id: "livraison", label: "Article 6 – Livraison" },
  { id: "retractation", label: "Article 7 – Droit de rétractation" },
  { id: "garanties", label: "Article 8 – Garanties" },
  { id: "responsabilite", label: "Article 9 – Responsabilité" },
  { id: "donnees", label: "Article 10 – Données personnelles" },
  { id: "droit", label: "Article 11 – Droit applicable" },
];

export default function CgvPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <Scale className="w-3.5 h-3.5" />
              Juridique
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              Conditions Générales de Vente
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted text-sm">
              Dernière mise à jour : 1er janvier 2026
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Table of contents */}
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-1 hidden lg:block"
            >
              <div className="sticky top-24 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
                  Sommaire
                </p>
                {toc.map((item) => (
                  <motion.a
                    key={item.id}
                    variants={staggerItem}
                    href={`#${item.id}`}
                    className="block text-xs text-muted hover:text-terracotta py-1.5 transition-colors leading-snug"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>
            </motion.nav>

            {/* Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-3 prose-sm"
            >
              {/* Mobile TOC */}
              <motion.div
                variants={fadeInUp}
                className="lg:hidden bg-white border border-border rounded-xl p-5 mb-8"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
                  Sommaire
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="text-xs text-muted hover:text-terracotta py-1 transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="text-sm text-muted leading-relaxed mb-8">
                <p>
                  Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent
                  l&apos;ensemble des ventes conclues par le biais du site internet
                  www.ishya.fr (ci-après « le Site ») exploité par la société ISHYA SAS.
                  Toute commande passée sur le Site implique l&apos;acceptation préalable
                  et sans réserve des présentes CGV.
                </p>
              </motion.div>

              <motion.article variants={fadeInUp} id="objet" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 1 – Objet
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Les présentes CGV ont pour objet de définir les droits et obligations des
                    parties dans le cadre de la vente en ligne de bijoux artisanaux en fleurs
                    séchées et résine proposés par ISHYA SAS sur le Site www.ishya.fr.
                  </p>
                  <p>
                    Elles s&apos;appliquent à toute commande passée par un acheteur
                    (ci-après « le Client ») auprès de la société ISHYA SAS
                    (ci-après « le Vendeur »). Le Client déclare avoir pris connaissance
                    des présentes CGV et les avoir acceptées avant de passer commande.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="produits" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 2 – Produits
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Les produits proposés à la vente sont des bijoux artisanaux fabriqués à
                    la main, contenant des fleurs séchées naturelles préservées dans de la
                    résine époxy. Chaque pièce étant unique et fabriquée artisanalement, de
                    légères variations de couleur, de forme ou de disposition des éléments
                    floraux peuvent exister par rapport aux photographies présentées sur le Site.
                  </p>
                  <p>
                    Ces variations sont inhérentes au processus de fabrication artisanale et
                    ne sauraient constituer un défaut de conformité. Le Vendeur s&apos;engage
                    à fournir des produits conformes à leur description et réalisés avec le
                    plus grand soin.
                  </p>
                  <p>
                    Les photographies illustrant les produits sur le Site sont les plus
                    fidèles possibles mais ne peuvent assurer une similitude parfaite avec le
                    produit reçu, notamment en raison des différences de rendu des couleurs
                    selon les écrans.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="prix" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 3 – Prix
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Les prix des produits sont indiqués en euros toutes taxes comprises (TTC),
                    hors frais de livraison. Les frais de livraison sont précisés au Client
                    avant la validation définitive de la commande.
                  </p>
                  <p>
                    Le Vendeur se réserve le droit de modifier ses prix à tout moment. Les
                    produits seront facturés au prix en vigueur au moment de la validation de
                    la commande. En cas de promotion, les prix réduits sont applicables
                    pendant la durée indiquée sur le Site.
                  </p>
                  <p>
                    La TVA applicable est celle en vigueur au jour de la commande. Tout
                    changement du taux de TVA pourra être répercuté sur le prix des produits.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="commandes" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 4 – Commandes
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Le Client peut passer commande sur le Site 24h/24 et 7j/7. La commande
                    est définitivement validée après confirmation du paiement. Un email de
                    confirmation récapitulant les détails de la commande est envoyé au Client.
                  </p>
                  <p>
                    Le Vendeur se réserve le droit de refuser ou d&apos;annuler toute
                    commande d&apos;un Client avec lequel il existerait un litige, ou en cas
                    de suspicion de fraude. Le Vendeur se réserve également le droit de
                    limiter les quantités commandées.
                  </p>
                  <p>
                    La commande ne peut être modifiée ou annulée par le Client que dans un
                    délai de 2 heures suivant sa validation, sous réserve que la commande
                    n&apos;ait pas déjà été expédiée.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="paiement" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 5 – Paiement
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Le paiement s&apos;effectue en ligne au moment de la validation de la
                    commande. Les moyens de paiement acceptés sont : carte bancaire
                    (Visa, Mastercard, American Express), PayPal et Apple Pay.
                  </p>
                  <p>
                    Le paiement est sécurisé par le prestataire Stripe, certifié PCI DSS
                    niveau 1. Les informations bancaires du Client ne sont jamais stockées
                    par le Vendeur. Le paiement en 3 fois sans frais est disponible pour
                    toute commande supérieure à 80€.
                  </p>
                  <p>
                    En cas de défaut de paiement ou de paiement irrégulier, le Vendeur se
                    réserve le droit de suspendre ou d&apos;annuler la commande.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="livraison" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 6 – Livraison
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Les livraisons sont effectuées à l&apos;adresse indiquée par le Client
                    lors de la commande. Les délais de livraison sont indiqués à titre
                    indicatif : livraison standard (Colissimo) sous 3 à 5 jours ouvrés,
                    livraison express (Chronopost) sous 1 à 2 jours ouvrés, Point Relais
                    (Mondial Relay) sous 4 à 6 jours ouvrés.
                  </p>
                  <p>
                    La livraison standard est offerte pour toute commande d&apos;un montant
                    supérieur ou égal à 60€ en France métropolitaine. Un numéro de suivi est
                    communiqué par email dès l&apos;expédition.
                  </p>
                  <p>
                    En cas de retard de livraison excédant 7 jours ouvrés par rapport au
                    délai annoncé, le Client pourra demander l&apos;annulation de sa commande
                    et obtenir le remboursement intégral des sommes versées, sous réserve que
                    le colis n&apos;ait pas été livré entre-temps.
                  </p>
                  <p>
                    Le Client est tenu de vérifier l&apos;état du colis à la réception. En
                    cas de dommage apparent, le Client doit émettre des réserves auprès du
                    transporteur et en informer le Vendeur dans les 48 heures.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="retractation" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 7 – Droit de rétractation
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Conformément aux articles L.221-18 et suivants du Code de la
                    consommation, le Client dispose d&apos;un délai de 14 jours calendaires
                    à compter de la réception du produit pour exercer son droit de
                    rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
                  </p>
                  <p>
                    Pour exercer ce droit, le Client doit notifier sa décision au Vendeur par
                    email à contact@ishya.fr ou par courrier, en utilisant le formulaire de
                    rétractation disponible sur le Site. Le produit doit être retourné dans
                    son état d&apos;origine, non porté, avec tous ses accessoires et dans son
                    emballage d&apos;origine.
                  </p>
                  <p>
                    Les frais de retour sont à la charge du Client. Le remboursement sera
                    effectué dans un délai maximum de 14 jours à compter de la réception du
                    produit retourné, par le même moyen de paiement que celui utilisé lors de
                    la commande.
                  </p>
                  <p>
                    <strong>Exceptions au droit de rétractation :</strong> Conformément à
                    l&apos;article L.221-28 du Code de la consommation, le droit de
                    rétractation ne s&apos;applique pas aux boucles d&apos;oreilles pour des
                    raisons d&apos;hygiène (sauf défaut de fabrication), ni aux produits
                    personnalisés ou fabriqués sur mesure selon les spécifications du Client.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="garanties" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 8 – Garanties
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Tous les produits vendus sur le Site bénéficient de la garantie légale de
                    conformité (articles L.217-4 à L.217-14 du Code de la consommation) et
                    de la garantie contre les vices cachés (articles 1641 à 1649 du Code
                    civil).
                  </p>
                  <p>
                    En cas de défaut de conformité constaté dans les 2 ans suivant la
                    livraison, le Client peut choisir entre la réparation ou le remplacement
                    du produit. Si ces deux solutions sont impossibles, le Client peut
                    retourner le produit et obtenir un remboursement intégral, ou conserver le
                    produit et obtenir un remboursement partiel.
                  </p>
                  <p>
                    La garantie ne couvre pas les dommages résultant d&apos;une utilisation
                    non conforme aux conseils d&apos;entretien fournis, d&apos;un choc,
                    d&apos;une chute ou de l&apos;usure normale du produit.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="responsabilite" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 9 – Responsabilité
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Le Vendeur ne saurait être tenu responsable de l&apos;inexécution du
                    contrat en cas de force majeure, de perturbation ou de grève des services
                    postaux ou des transporteurs, ou d&apos;inondation ou d&apos;incendie.
                  </p>
                  <p>
                    La responsabilité du Vendeur ne pourra en aucun cas être engagée pour les
                    dommages indirects occasionnés à l&apos;occasion de la vente des produits.
                    En tout état de cause, la responsabilité du Vendeur est limitée au montant
                    de la commande concernée.
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="donnees" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 10 – Données personnelles
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Les données personnelles collectées lors de la commande sont nécessaires
                    au traitement de celle-ci. Elles font l&apos;objet d&apos;un traitement
                    informatique conformément au Règlement Général sur la Protection des
                    Données (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978
                    modifiée.
                  </p>
                  <p>
                    Pour plus d&apos;informations sur le traitement de vos données
                    personnelles, veuillez consulter notre{" "}
                    <a
                      href="/confidentialite"
                      className="text-terracotta hover:underline"
                    >
                      Politique de confidentialité
                    </a>
                    .
                  </p>
                </div>
              </motion.article>

              <motion.article variants={fadeInUp} id="droit" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl mb-4">
                  Article 11 – Droit applicable et litiges
                </h2>
                <div className="text-sm text-muted leading-relaxed space-y-3">
                  <p>
                    Les présentes CGV sont soumises au droit français. En cas de litige, le
                    Client est informé qu&apos;il peut recourir à une procédure de médiation
                    conventionnelle ou à tout autre mode alternatif de règlement des
                    différends.
                  </p>
                  <p>
                    Conformément à l&apos;article L.612-1 du Code de la consommation, le
                    Client peut recourir gratuitement au service de médiation MEDICYS, par
                    voie électronique à l&apos;adresse www.medicys.fr ou par courrier à
                    l&apos;adresse : MEDICYS – 73 Boulevard de Clichy, 75009 Paris.
                  </p>
                  <p>
                    Le Client peut également présenter ses réclamations sur la plateforme
                    européenne de règlement en ligne des litiges accessible à l&apos;adresse :
                    https://ec.europa.eu/consumers/odr.
                  </p>
                  <p>
                    À défaut de résolution amiable, les tribunaux français seront seuls
                    compétents pour connaître du litige.
                  </p>
                </div>
              </motion.article>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
