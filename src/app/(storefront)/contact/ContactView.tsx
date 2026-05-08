"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Clock,
  MapPin,
  Phone,
  Send,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { submitContactMessage } from "@/lib/actions/contact";
import { PinterestIcon, TikTokIcon } from "@/components/icons/social";
import type { SocialLinks } from "@/lib/queries/storefront";

const subjects = [
  "Question sur un produit",
  "Suivi de commande",
  "Retour ou échange",
  "Problème de paiement",
  "Partenariat / Presse",
  "Autre",
];

export function ContactView({ social }: { social: SocialLinks }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const contactEmail = social.contactEmail || "contact@ishya.fr";
  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: contactEmail,
      href: `mailto:${contactEmail}`,
    },
    {
      icon: Phone,
      label: "Téléphone",
      value: "+33 1 23 45 67 89",
      href: "tel:+33123456789",
    },
    {
      icon: Clock,
      label: "Horaires",
      value: "Lun – Ven, 9h – 18h",
      href: null,
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: "12 Rue de la Paix, 75002 Paris",
      href: null,
    },
  ];

  const socials: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
  }> = [];
  if (social.instagramUrl)
    socials.push({ icon: Instagram, label: "Instagram", href: social.instagramUrl });
  if (social.facebookUrl)
    socials.push({ icon: Facebook, label: "Facebook", href: social.facebookUrl });
  if (social.pinterestUrl)
    socials.push({ icon: PinterestIcon, label: "Pinterest", href: social.pinterestUrl });
  if (social.tiktokUrl)
    socials.push({ icon: TikTokIcon, label: "TikTok", href: social.tiktokUrl });
  if (social.youtubeUrl)
    socials.push({ icon: Youtube, label: "YouTube", href: social.youtubeUrl });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitContactMessage({
        name: form.name,
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message);
      setSubmitted(true);
    });
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-bone-soft/50 py-16 md:py-24 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-ember/10 text-ember-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Contact
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Contactez-nous
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-steel">
              Une question, une suggestion ou simplement envie de dire bonjour ?
              Nous sommes là pour vous.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-3"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-success/5 border border-success/20 rounded-2xl p-8 md:p-12 text-center"
                >
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-success" />
                  </div>
                  <h2 className="font-display text-2xl mb-2">
                    Message envoyé !
                  </h2>
                  <p className="text-steel text-sm">
                    Merci pour votre message. Nous vous répondrons dans les plus
                    brefs délais, généralement sous 24 heures.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div variants={fadeInUp}>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Nom complet
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 bg-bone border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember transition-all"
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Adresse email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="vous@exemple.com"
                      className="w-full px-4 py-3 bg-bone border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember transition-all"
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-2"
                    >
                      Sujet
                    </label>
                    <select
                      id="subject"
                      required
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-bone border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember transition-all appearance-none"
                    >
                      <option value="">Sélectionner un sujet</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Décrivez votre demande en détail..."
                      className="w-full px-4 py-3 bg-bone border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember transition-all resize-none"
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn-primary w-full gap-2"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Envoi en cours…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-2 space-y-8"
            >
              {/* Info cards */}
              <motion.div variants={staggerContainer} className="space-y-4">
                {contactInfo.map((info) => (
                  <motion.div
                    key={info.label}
                    variants={staggerItem}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-ember/10 rounded-xl flex items-center justify-center shrink-0">
                      <info.icon className="w-4 h-4 text-ember" />
                    </div>
                    <div>
                      <p className="text-xs text-steel uppercase tracking-wider mb-0.5">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm font-medium hover:text-ember transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Response time */}
              <motion.div
                variants={fadeInUp}
                className="bg-ember/5 border border-terracotta/15 rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-ember" />
                  <p className="text-sm font-medium">
                    Temps de réponse moyen : 24h
                  </p>
                </div>
                <p className="text-xs text-steel">
                  Nous nous efforçons de répondre à toutes les demandes sous 24
                  heures ouvrées.
                </p>
              </motion.div>

              {/* Social */}
              {socials.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <p className="text-sm font-medium mb-3">Suivez-nous</p>
                  <div className="flex gap-3">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-bone border border-border rounded-xl flex items-center justify-center hover:border-ember hover:text-ember transition-all"
                        aria-label={s.label}
                      >
                        <s.icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Map placeholder */}
              <motion.div
                variants={fadeInUp}
                className="bg-bone-soft/50 border border-border rounded-2xl h-52 flex flex-col items-center justify-center gap-2"
              >
                <MapPin className="w-8 h-8 text-ember/50" />
                <p className="text-sm text-steel">
                  12 Rue de la Paix, Paris 2e
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
