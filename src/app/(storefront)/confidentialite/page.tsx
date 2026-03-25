"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function ConfidentialitePage() {
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
              <Shield className="w-3.5 h-3.5" />
              RGPD
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              Politique de Confidentialité
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted text-sm">
              Dernière mise à jour : 1er janvier 2026
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-10"
          >
            <motion.div variants={fadeInUp} className="text-sm text-muted leading-relaxed">
              <p>
                La société ISHYA SAS (ci-après « ISHYA » ou « nous ») attache une grande
                importance à la protection de vos données personnelles. La présente
                politique de confidentialité a pour objet de vous informer sur la manière
                dont nous collectons, utilisons et protégeons vos données, conformément
                au Règlement Général sur la Protection des Données (RGPD – Règlement UE
                2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.
              </p>
            </motion.div>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                1. Responsable du traitement
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>Le responsable du traitement des données personnelles est :</p>
                <div className="bg-beige-nude-light/50 rounded-xl p-5 space-y-1">
                  <p className="font-medium text-foreground">ISHYA SAS</p>
                  <p>12 Rue de la Paix, 75002 Paris</p>
                  <p>Email : dpo@ishya.fr</p>
                  <p>SIRET : 912 345 678 00012</p>
                </div>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                2. Données collectées
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Dans le cadre de notre activité, nous sommes amenés à collecter les
                  données personnelles suivantes :
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Données d&apos;identification :</strong> nom, prénom, adresse
                    email, numéro de téléphone, adresse postale.
                  </li>
                  <li>
                    <strong>Données de commande :</strong> historique des commandes,
                    détails des produits achetés, adresses de livraison et de facturation.
                  </li>
                  <li>
                    <strong>Données de paiement :</strong> les informations bancaires sont
                    traitées directement par notre prestataire de paiement Stripe et ne
                    sont jamais stockées sur nos serveurs.
                  </li>
                  <li>
                    <strong>Données de navigation :</strong> adresse IP, type de
                    navigateur, pages visitées, durée de la visite, via des cookies et
                    technologies similaires.
                  </li>
                  <li>
                    <strong>Données de communication :</strong> messages envoyés via le
                    formulaire de contact, emails échangés.
                  </li>
                </ul>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                3. Finalités du traitement
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>Vos données personnelles sont collectées pour les finalités suivantes :</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Traitement et suivi de vos commandes</li>
                  <li>Gestion de votre compte client</li>
                  <li>Livraison de vos produits</li>
                  <li>Gestion des retours et du service après-vente</li>
                  <li>Envoi de communications marketing (avec votre consentement)</li>
                  <li>Amélioration de notre Site et de nos services</li>
                  <li>Respect de nos obligations légales et réglementaires</li>
                  <li>Prévention de la fraude</li>
                </ul>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                4. Base légale du traitement
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Exécution du contrat :</strong> traitement de vos commandes,
                    livraison, gestion de votre compte.
                  </li>
                  <li>
                    <strong>Consentement :</strong> envoi de newsletters et communications
                    marketing, dépôt de cookies non essentiels.
                  </li>
                  <li>
                    <strong>Intérêt légitime :</strong> amélioration de nos services,
                    prévention de la fraude, statistiques anonymisées.
                  </li>
                  <li>
                    <strong>Obligation légale :</strong> conservation des données de
                    facturation, réponse aux réquisitions judiciaires.
                  </li>
                </ul>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                5. Destinataires des données
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Vos données personnelles peuvent être partagées avec les catégories de
                  destinataires suivantes :
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Nos prestataires de paiement (Stripe)</li>
                  <li>Nos transporteurs (Colissimo, Chronopost, Mondial Relay)</li>
                  <li>
                    Notre hébergeur (Vercel Inc.) et notre fournisseur de base de données
                    (Supabase)
                  </li>
                  <li>Notre prestataire d&apos;emailing (Resend)</li>
                  <li>Les autorités compétentes en cas d&apos;obligation légale</li>
                </ul>
                <p>
                  Nous ne vendons ni ne louons vos données personnelles à des tiers. Nos
                  prestataires sont contractuellement tenus de garantir la sécurité et la
                  confidentialité de vos données.
                </p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                6. Durée de conservation
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>Vos données sont conservées pendant les durées suivantes :</p>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-beige-nude-light/50">
                        <th className="text-left py-3 px-4 font-medium">Type de données</th>
                        <th className="text-left py-3 px-4 font-medium">Durée</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">Données de compte</td>
                        <td className="py-3 px-4">3 ans après la dernière activité</td>
                      </tr>
                      <tr className="border-t border-border bg-white">
                        <td className="py-3 px-4">Données de commande</td>
                        <td className="py-3 px-4">5 ans (obligation comptable)</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">Données de facturation</td>
                        <td className="py-3 px-4">10 ans (obligation fiscale)</td>
                      </tr>
                      <tr className="border-t border-border bg-white">
                        <td className="py-3 px-4">Cookies</td>
                        <td className="py-3 px-4">13 mois maximum</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">Données de prospection</td>
                        <td className="py-3 px-4">3 ans après le dernier contact</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                7. Cookies
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Notre Site utilise des cookies pour assurer son bon fonctionnement,
                  mesurer l&apos;audience et, avec votre consentement, personnaliser votre
                  expérience.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Cookies essentiels :</strong> nécessaires au fonctionnement du
                    Site (session, panier, authentification). Ils ne peuvent pas être
                    désactivés.
                  </li>
                  <li>
                    <strong>Cookies analytiques :</strong> nous permettent de comprendre
                    comment les visiteurs utilisent le Site (pages vues, parcours de
                    navigation). Soumis à votre consentement.
                  </li>
                  <li>
                    <strong>Cookies marketing :</strong> utilisés pour vous proposer du
                    contenu personnalisé. Soumis à votre consentement.
                  </li>
                </ul>
                <p>
                  Vous pouvez gérer vos préférences de cookies à tout moment via le
                  bandeau de cookies ou les paramètres de votre navigateur.
                </p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                8. Vos droits
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Conformément au RGPD, vous disposez des droits suivants concernant vos
                  données personnelles :
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Droit d&apos;accès :</strong> obtenir la confirmation que vos
                    données sont traitées et en recevoir une copie.
                  </li>
                  <li>
                    <strong>Droit de rectification :</strong> demander la correction de
                    données inexactes ou incomplètes.
                  </li>
                  <li>
                    <strong>Droit à l&apos;effacement :</strong> demander la suppression
                    de vos données dans les conditions prévues par le RGPD.
                  </li>
                  <li>
                    <strong>Droit à la limitation :</strong> demander la limitation du
                    traitement de vos données.
                  </li>
                  <li>
                    <strong>Droit à la portabilité :</strong> recevoir vos données dans un
                    format structuré et couramment utilisé.
                  </li>
                  <li>
                    <strong>Droit d&apos;opposition :</strong> vous opposer au traitement
                    de vos données pour des motifs légitimes.
                  </li>
                  <li>
                    <strong>Droit de retrait du consentement :</strong> retirer votre
                    consentement à tout moment pour les traitements basés sur celui-ci.
                  </li>
                </ul>
                <p>
                  Pour exercer vos droits, contactez notre Délégué à la Protection des
                  Données à l&apos;adresse dpo@ishya.fr ou par courrier à : ISHYA SAS –
                  DPO, 12 Rue de la Paix, 75002 Paris. Nous répondrons à votre demande
                  dans un délai d&apos;un mois.
                </p>
                <p>
                  Vous disposez également du droit d&apos;introduire une réclamation
                  auprès de la CNIL (Commission Nationale de l&apos;Informatique et des
                  Libertés) : www.cnil.fr.
                </p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                9. Sécurité des données
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Nous mettons en œuvre les mesures techniques et organisationnelles
                  appropriées pour garantir un niveau de sécurité adapté au risque :
                  chiffrement SSL/TLS des communications, accès restreint aux données,
                  authentification renforcée, sauvegardes régulières et tests de sécurité
                  périodiques.
                </p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp} className="scroll-mt-24">
              <h2 className="font-display text-xl md:text-2xl mb-4">
                10. Contact DPO
              </h2>
              <div className="text-sm text-muted leading-relaxed">
                <div className="bg-terracotta/5 border border-terracotta/15 rounded-xl p-5 space-y-1">
                  <p className="font-medium text-foreground">
                    Délégué à la Protection des Données
                  </p>
                  <p>Email : dpo@ishya.fr</p>
                  <p>Adresse : ISHYA SAS – DPO, 12 Rue de la Paix, 75002 Paris</p>
                </div>
              </div>
            </motion.article>
          </motion.div>
        </div>
      </div>
    </>
  );
}
