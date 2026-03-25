"use client";

import { motion } from "framer-motion";
import { Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const ringSizes = [
  { fr: "48", eu: "48", us: "4.5", uk: "I", diam: "15.3" },
  { fr: "50", eu: "50", us: "5.5", uk: "K", diam: "15.9" },
  { fr: "52", eu: "52", us: "6", uk: "L½", diam: "16.5" },
  { fr: "54", eu: "54", us: "7", uk: "N", diam: "17.2" },
  { fr: "56", eu: "56", us: "7.5", uk: "O½", diam: "17.8" },
  { fr: "58", eu: "58", us: "8.5", uk: "Q", diam: "18.4" },
  { fr: "60", eu: "60", us: "9", uk: "R½", diam: "19.1" },
  { fr: "62", eu: "62", us: "10", uk: "T", diam: "19.7" },
];

const necklaceLengths = [
  { length: "35-38cm", name: "Ras-de-cou", desc: "Épouse le cou. Idéal avec un décolleté en V." },
  { length: "40-45cm", name: "Princesse", desc: "La longueur classique. S'accorde avec tout." },
  { length: "50-55cm", name: "Matinée", desc: "Sous la clavicule. Parfait sur un pull." },
  { length: "60-70cm", name: "Opéra", desc: "Long et élégant. Superbe en sautoir." },
];

const braceletSizes = [
  { circ: "14-15cm", size: "XS", desc: "Poignet très fin" },
  { circ: "15-16cm", size: "S", desc: "Poignet fin" },
  { circ: "16-17cm", size: "M", desc: "Taille standard" },
  { circ: "17-18cm", size: "L", desc: "Poignet moyen" },
  { circ: "18-19cm", size: "XL", desc: "Poignet large" },
];

export default function GuideTaillesPage() {
  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            >
              <Ruler className="w-3.5 h-3.5" />
              Guide pratique
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-5xl mb-4"
            >
              Guide des Tailles
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted max-w-lg mx-auto">
              Trouvez votre taille idéale pour chacun de nos bijoux. En cas de
              doute, n&apos;hésitez pas à nous contacter.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="py-12 px-4">
        <div className="container max-w-4xl mx-auto space-y-20">
          {/* ── Bagues ─────────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <h2 className="font-display text-2xl md:text-3xl mb-3">
                Tailles de bagues
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                Pour mesurer votre tour de doigt, enroulez un fil ou une bande
                de papier autour de votre doigt, marquez le point de
                chevauchement et mesurez la longueur obtenue. Consultez le
                tableau ci-dessous pour trouver votre taille.
              </p>
            </motion.div>

            {/* Visual ring sizer */}
            <motion.div
              variants={fadeInUp}
              className="bg-beige-nude-light/50 rounded-2xl p-6 md:p-8 mb-8"
            >
              <p className="text-sm font-medium mb-4">
                Astuce : imprimez cette page et posez votre bague sur les
                cercles ci-dessous
              </p>
              <div className="flex flex-wrap gap-4 items-end">
                {[48, 50, 52, 54, 56, 58].map((size) => {
                  const diam = (size / Math.PI).toFixed(0);
                  return (
                    <div
                      key={size}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="rounded-full border-2 border-terracotta"
                        style={{
                          width: `${Number(diam) * 1.5}px`,
                          height: `${Number(diam) * 1.5}px`,
                        }}
                      />
                      <span className="text-xs font-medium">{size}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="overflow-x-auto rounded-xl border border-border"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-beige-nude-light/50">
                    <th className="text-left py-3 px-4 font-medium">FR/EU</th>
                    <th className="text-left py-3 px-4 font-medium">US</th>
                    <th className="text-left py-3 px-4 font-medium">UK</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Ø intérieur (mm)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ringSizes.map((row, idx) => (
                    <tr
                      key={row.fr}
                      className={cn(
                        "border-t border-border",
                        idx % 2 === 0 && "bg-white"
                      )}
                    >
                      <td className="py-3 px-4 font-medium">{row.fr}</td>
                      <td className="py-3 px-4 text-muted">{row.us}</td>
                      <td className="py-3 px-4 text-muted">{row.uk}</td>
                      <td className="py-3 px-4 text-muted">{row.diam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.section>

          {/* ── Colliers ───────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <h2 className="font-display text-2xl md:text-3xl mb-3">
                Longueurs de colliers
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                La longueur idéale dépend de votre morphologie et du style
                recherché. Voici un guide pour vous aider à choisir.
              </p>
            </motion.div>

            {/* Visual necklace length diagram */}
            <motion.div
              variants={fadeInUp}
              className="bg-beige-nude-light/50 rounded-2xl p-6 md:p-8 mb-8"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-64">
                  {/* Silhouette placeholder */}
                  <div className="absolute inset-x-0 top-0 h-12 rounded-full bg-beige-nude mx-auto w-12" />
                  <div className="absolute inset-x-0 top-14 mx-auto w-24 h-48 rounded-t-3xl bg-beige-nude" />
                  {/* Necklace lines */}
                  {necklaceLengths.map((n, i) => (
                    <div
                      key={n.name}
                      className="absolute left-1/2 -translate-x-1/2 border-b-2 border-dashed"
                      style={{
                        top: `${40 + i * 35}px`,
                        width: `${60 + i * 20}px`,
                        borderColor:
                          i === 0
                            ? "var(--terracotta)"
                            : i === 1
                              ? "var(--gold)"
                              : i === 2
                                ? "var(--muted)"
                                : "var(--foreground)",
                      }}
                    >
                      <span
                        className="absolute -right-20 -top-2 text-[10px] whitespace-nowrap font-medium"
                        style={{
                          color:
                            i === 0
                              ? "var(--terracotta)"
                              : i === 1
                                ? "var(--gold)"
                                : "var(--muted)",
                        }}
                      >
                        {n.length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-4"
            >
              {necklaceLengths.map((n) => (
                <motion.div
                  key={n.name}
                  variants={staggerItem}
                  className="bg-white rounded-xl border border-border p-5"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-medium">{n.name}</h3>
                    <span className="text-sm text-terracotta font-medium">
                      {n.length}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{n.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* ── Bracelets ──────────────────────────────────────── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <h2 className="font-display text-2xl md:text-3xl mb-3">
                Tailles de bracelets
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                Mesurez votre tour de poignet avec un mètre ruban souple.
                Ajoutez 1 à 2 cm pour un port confortable.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="overflow-x-auto rounded-xl border border-border"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-beige-nude-light/50">
                    <th className="text-left py-3 px-4 font-medium">Taille</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Tour de poignet
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {braceletSizes.map((row, idx) => (
                    <tr
                      key={row.size}
                      className={cn(
                        "border-t border-border",
                        idx % 2 === 0 && "bg-white"
                      )}
                    >
                      <td className="py-3 px-4 font-medium">{row.size}</td>
                      <td className="py-3 px-4 text-muted">{row.circ}</td>
                      <td className="py-3 px-4 text-muted">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Tip box */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 bg-terracotta/5 border border-terracotta/20 rounded-xl p-6"
            >
              <h3 className="font-medium mb-2">
                💡 Vous hésitez entre deux tailles ?
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Choisissez la taille supérieure. Nos bracelets et bagues sont
                ajustables dans la mesure du possible. Pour les colliers, optez
                pour la longueur qui se rapproche le plus de votre style
                habituel. N&apos;hésitez pas à nous contacter pour un conseil
                personnalisé.
              </p>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
