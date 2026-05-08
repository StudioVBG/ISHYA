"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flower2,
  Leaf,
  Gem,
  Heart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const values = [
  {
    icon: Flower2,
    title: "Artisanat",
    desc: "Chaque bijou est façonné à la main dans notre atelier parisien. De la sélection des fleurs à la mise en résine, chaque étape est réalisée avec une attention méticuleuse aux détails.",
  },
  {
    icon: Leaf,
    title: "Durabilité",
    desc: "Nous privilégions des matériaux éco-responsables et des fleurs cultivées localement. Nos résines sont hypoallergéniques et nos emballages sont recyclables et fabriqués en France.",
  },
  {
    icon: Gem,
    title: "Beauté naturelle",
    desc: "Nous croyons que la nature est la plus grande artiste. En capturant la beauté éphémère des fleurs dans la résine, nous créons des pièces uniques qui durent pour toujours.",
  },
];

const process = [
  {
    step: "01",
    title: "Cueillette",
    desc: "Nous sélectionnons les plus belles fleurs de saison auprès de producteurs locaux d'Île-de-France. Chaque fleur est choisie pour sa couleur, sa forme et sa capacité à se conserver.",
  },
  {
    step: "02",
    title: "Séchage",
    desc: "Les fleurs sont délicatement séchées pendant 2 à 4 semaines dans notre atelier. Ce processus naturel préserve leurs couleurs tout en leur donnant cette texture si particulière.",
  },
  {
    step: "03",
    title: "Mise en résine",
    desc: "Chaque fleur est méticuleusement disposée dans un moule en silicone, puis recouverte de résine époxy transparente de qualité bijouterie. La polymérisation dure 48 heures.",
  },
  {
    step: "04",
    title: "Montage & Finition",
    desc: "La pièce en résine est démoulée, polie à la main et montée sur des supports en acier inoxydable plaqué or. Chaque bijou est inspecté individuellement avant d'être écriné.",
  },
];

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=1920&h=900&fit=crop"
          alt="Atelier ISHYA – Création de bijoux floraux"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 text-center text-bone px-4 max-w-3xl"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 bg-bone-soft/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-6"
          >
            <Heart className="w-3.5 h-3.5" />
            Notre histoire
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl lg:text-7xl mb-4"
          >
            La beauté éternelle
            <br />
            des fleurs
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-bone/80 text-lg max-w-xl mx-auto"
          >
            Depuis 2022, ISHYA capture la poésie des fleurs séchées dans des
            créations uniques qui traversent le temps.
          </motion.p>
        </motion.div>
      </section>

      {/* La naissance d'ISHYA */}
      <section className="py-20 md:py-28 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.p
                variants={fadeInUp}
                className="text-xs text-ember font-medium uppercase tracking-wider mb-3"
              >
                L&apos;origine
              </motion.p>
              <motion.h2
                variants={fadeInUp}
                className="font-display text-3xl md:text-4xl mb-6"
              >
                La naissance d&apos;ISHYA
              </motion.h2>
              <motion.div
                variants={staggerContainer}
                className="space-y-4 text-steel leading-relaxed"
              >
                <motion.p variants={staggerItem}>
                  Tout a commencé par une passion pour les fleurs et un désir
                  profond de capturer leur beauté éphémère. En 2022, dans un
                  petit atelier au cœur de Paris, l&apos;idée d&apos;ISHYA est
                  née : créer des bijoux qui emprisonnent la grâce des fleurs
                  séchées dans la résine, pour que chaque pièce raconte une
                  histoire de nature et d&apos;élégance.
                </motion.p>
                <motion.p variants={staggerItem}>
                  Le nom « ISHYA » s&apos;inspire du sanskrit et signifie
                  « celle qui apporte la prospérité ». C&apos;est cette
                  philosophie qui guide chacune de nos créations : apporter
                  joie, beauté et connexion à la nature à travers des pièces
                  artisanales uniques.
                </motion.p>
                <motion.p variants={staggerItem}>
                  Chaque bijou ISHYA est une œuvre miniature, un fragment de
                  jardin que vous pouvez porter sur vous. Des pétales de rose
                  terracotta aux délicates fleurs de gypsophile, chaque
                  création est pensée pour célébrer la beauté brute et
                  intemporelle de la nature.
                </motion.p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=1000&fit=crop"
                alt="Fleurs séchées pour la création de bijoux"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="py-20 bg-bone-soft/50 px-4">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.p
              variants={fadeInUp}
              className="text-xs text-ember font-medium uppercase tracking-wider mb-3"
            >
              Ce qui nous anime
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl md:text-4xl"
            >
              Nos valeurs
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={staggerItem}
                className="bg-bone-soft rounded-2xl p-8 border border-border text-center"
              >
                <div className="w-14 h-14 bg-ember/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-6 h-6 text-ember" />
                </div>
                <h3 className="font-display text-xl mb-3">{v.title}</h3>
                <p className="text-sm text-steel leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Notre savoir-faire */}
      <section className="py-20 md:py-28 px-4">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.p
              variants={fadeInUp}
              className="text-xs text-ember font-medium uppercase tracking-wider mb-3"
            >
              De la fleur au bijou
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl md:text-4xl mb-4"
            >
              Notre savoir-faire
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-steel max-w-lg mx-auto"
            >
              Un processus artisanal minutieux, entièrement réalisé à la main,
              pour créer des bijoux d&apos;exception.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 gap-6"
          >
            {process.map((p) => (
              <motion.div
                key={p.step}
                variants={staggerItem}
                className="group bg-bone-soft border border-border rounded-2xl p-8 hover:border-ember/40 transition-all"
              >
                <span className="text-5xl font-display text-ember/20 group-hover:text-ember/40 transition-colors">
                  {p.step}
                </span>
                <h3 className="font-display text-xl mt-2 mb-3">{p.title}</h3>
                <p className="text-sm text-steel leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* L'équipe */}
      <section className="py-20 bg-bone-soft/50 px-4">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.p
              variants={fadeInUp}
              className="text-xs text-ember font-medium uppercase tracking-wider mb-3"
            >
              Les mains derrière ISHYA
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl md:text-4xl"
            >
              L&apos;équipe
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto bg-bone-soft rounded-2xl border border-border overflow-hidden"
          >
            <div className="aspect-[4/3] relative bg-beige-nude">
              <Image
                src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&h=450&fit=crop"
                alt="Fondatrice d'ISHYA"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 text-center">
              <h3 className="font-display text-xl mb-1">Camille Laurent</h3>
              <p className="text-sm text-ember mb-3">
                Fondatrice & Créatrice
              </p>
              <p className="text-sm text-steel leading-relaxed">
                Ancienne ingénieure reconvertie par passion pour l&apos;art
                floral, Camille a fondé ISHYA avec la conviction que chaque
                fleur mérite de vivre éternellement. Formée en bijouterie
                artisanale, elle conçoit et réalise chaque pièce dans son
                atelier parisien.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp}>
              <Sparkles className="w-8 h-8 text-ember mx-auto mb-4" />
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl md:text-4xl mb-4"
            >
              Prêt(e) à découvrir nos créations ?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-steel mb-8 max-w-md mx-auto"
            >
              Explorez notre collection de bijoux floraux artisanaux, chacun
              unique et porteur d&apos;une histoire.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/boutique" className="btn-primary gap-2">
                Découvrir nos créations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
