"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function MentionsLegalesPage() {
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
              <FileText className="w-3.5 h-3.5" />
              Juridique
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              Mentions Légales
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted text-sm">
              Conformément à la loi n° 2004-575 du 21 juin 2004 pour la
              confiance dans l&apos;économie numérique.
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
            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                1. Éditeur du site
              </h2>
              <div className="text-sm text-muted leading-relaxed">
                <div className="bg-beige-nude-light/50 rounded-xl p-6 space-y-2">
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Raison sociale
                      </p>
                      <p className="font-medium text-foreground">ISHYA SAS</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Forme juridique
                      </p>
                      <p className="font-medium text-foreground">
                        Société par Actions Simplifiée
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        SIRET
                      </p>
                      <p className="font-medium text-foreground">
                        912 345 678 00012
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        RCS
                      </p>
                      <p className="font-medium text-foreground">
                        Paris B 912 345 678
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Capital social
                      </p>
                      <p className="font-medium text-foreground">10 000 €</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        N° TVA intracommunautaire
                      </p>
                      <p className="font-medium text-foreground">
                        FR 12 912345678
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Siège social
                      </p>
                      <p className="font-medium text-foreground">
                        12 Rue de la Paix, 75002 Paris
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Téléphone
                      </p>
                      <p className="font-medium text-foreground">
                        +33 1 23 45 67 89
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="font-medium text-foreground">
                        contact@ishya.fr
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                2. Directeur de la publication
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Le directeur de la publication du site www.ishya.fr est Mme Camille
                  Laurent, en sa qualité de Présidente de la société ISHYA SAS.
                </p>
                <p>Contact : direction@ishya.fr</p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                3. Hébergeur
              </h2>
              <div className="text-sm text-muted leading-relaxed">
                <div className="bg-beige-nude-light/50 rounded-xl p-6 space-y-2">
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Raison sociale
                      </p>
                      <p className="font-medium text-foreground">Vercel Inc.</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Adresse
                      </p>
                      <p className="font-medium text-foreground">
                        340 S Lemon Ave #4133, Walnut, CA 91789, USA
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Site web
                      </p>
                      <p className="font-medium text-foreground">
                        https://vercel.com
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted/70 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="font-medium text-foreground">
                        privacy@vercel.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                4. Propriété intellectuelle
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  L&apos;ensemble des éléments constituant le site www.ishya.fr
                  (textes, images, photographies, vidéos, logos, marques, éléments
                  graphiques, logiciels, base de données) sont la propriété exclusive
                  de la société ISHYA SAS ou de ses partenaires, et sont protégés par
                  les lois françaises et internationales relatives à la propriété
                  intellectuelle.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication,
                  adaptation, totale ou partielle, de ces éléments, quel que soit le
                  moyen ou le procédé utilisé, est interdite sans l&apos;autorisation
                  écrite préalable de la société ISHYA SAS.
                </p>
                <p>
                  Toute exploitation non autorisée du site ou de l&apos;un quelconque
                  de ses éléments sera considérée comme constitutive d&apos;une
                  contrefaçon et poursuivie conformément aux dispositions des articles
                  L.335-2 et suivants du Code de la propriété intellectuelle.
                </p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                5. Crédits photos
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Les photographies des produits présentées sur le site sont réalisées
                  par le studio ISHYA ou par des photographes mandatés par la société.
                  Toute utilisation sans autorisation est strictement interdite.
                </p>
                <p>
                  Certaines images d&apos;ambiance et de mise en scène peuvent
                  provenir de banques d&apos;images sous licence (Unsplash, Adobe
                  Stock). Les crédits spécifiques sont disponibles sur demande.
                </p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                6. Données personnelles
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Le traitement des données personnelles collectées sur le site est
                  détaillé dans notre{" "}
                  <a
                    href="/confidentialite"
                    className="text-terracotta hover:underline"
                  >
                    Politique de confidentialité
                  </a>
                  .
                </p>
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD),
                  vous disposez d&apos;un droit d&apos;accès, de rectification, de
                  suppression et de portabilité de vos données, que vous pouvez exercer en
                  contactant notre DPO à l&apos;adresse dpo@ishya.fr.
                </p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                7. Cookies
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  Le site www.ishya.fr utilise des cookies pour assurer le bon
                  fonctionnement du site, mesurer l&apos;audience et personnaliser
                  l&apos;expérience utilisateur. Pour plus d&apos;informations sur
                  l&apos;utilisation des cookies, consultez notre{" "}
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

            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                8. Limitation de responsabilité
              </h2>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  ISHYA SAS s&apos;efforce d&apos;assurer l&apos;exactitude des
                  informations diffusées sur le site, mais ne peut être tenue
                  responsable d&apos;éventuelles omissions, inexactitudes ou erreurs.
                  Les informations sont fournies à titre indicatif et peuvent être
                  modifiées à tout moment sans préavis.
                </p>
                <p>
                  ISHYA SAS ne saurait être tenue responsable des dommages directs ou
                  indirects causés au matériel de l&apos;utilisateur lors de
                  l&apos;accès au site, résultant de l&apos;utilisation d&apos;un
                  matériel ne répondant pas aux spécifications requises, ou de
                  l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
                </p>
              </div>
            </motion.article>

            <motion.article variants={fadeInUp}>
              <h2 className="font-display text-xl md:text-2xl mb-4">
                9. Droit applicable
              </h2>
              <div className="text-sm text-muted leading-relaxed">
                <p>
                  Les présentes mentions légales sont régies par le droit français. En
                  cas de litige et à défaut de résolution amiable, les tribunaux
                  français seront seuls compétents pour en connaître.
                </p>
              </div>
            </motion.article>
          </motion.div>
        </div>
      </div>
    </>
  );
}
