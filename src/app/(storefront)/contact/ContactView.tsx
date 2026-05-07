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
import type { SocialLinks } from "@/lib/queries/storefront";

const subjects = [
  "Question sur un produit",
  "Suivi de commande",
  "Retour ou échange",
  "Problème de paiement",
  "Partenariat / Presse",
  "Autre",
];

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.45a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.08Z" />
    </svg>
  );
}

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
              <MessageCircle className="w-3.5 h-3.5" />
              Contact
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl mb-4"
            >
              Contactez-nous
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted">
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
                  <p className="text-muted text-sm">
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
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
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
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
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
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all appearance-none"
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
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all resize-none"
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
                    <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center shrink-0">
                      <info.icon className="w-4 h-4 text-terracotta" />
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-0.5">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm font-medium hover:text-terracotta transition-colors"
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
                className="bg-terracotta/5 border border-terracotta/15 rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-terracotta" />
                  <p className="text-sm font-medium">
                    Temps de réponse moyen : 24h
                  </p>
                </div>
                <p className="text-xs text-muted">
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
                        className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center hover:border-terracotta hover:text-terracotta transition-all"
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
                className="bg-beige-nude-light/50 border border-border rounded-2xl h-52 flex flex-col items-center justify-center gap-2"
              >
                <MapPin className="w-8 h-8 text-terracotta/50" />
                <p className="text-sm text-muted">
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
