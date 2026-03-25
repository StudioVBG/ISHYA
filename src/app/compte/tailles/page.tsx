"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Ruler,
  Save,
  Check,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const ringSizes = Array.from({ length: 13 }, (_, i) => 44 + i * 2);
const braceletSizes = [
  { label: "S (15cm)", value: "S" },
  { label: "M (17cm)", value: "M" },
  { label: "L (19cm)", value: "L" },
];
const necklaceLengths = [38, 42, 45, 50, 60];

export default function TaillesPage() {
  const [ringSize, setRingSize] = useState<number | "">("");
  const [braceletSize, setBraceletSize] = useState("");
  const [necklaceLength, setNecklaceLength] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectClass =
    "w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all appearance-none cursor-pointer";

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">
          Mes tailles
        </h1>
        <p className="text-sm text-muted mt-1">
          Enregistrez vos tailles pour faciliter vos achats
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Ring size */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-beige-nude-light flex items-center justify-center">
              <span className="text-lg">💍</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">
                Taille de bague
              </h2>
              <p className="text-xs text-muted">
                Taille française (diamètre en mm)
              </p>
            </div>
          </div>

          <select
            value={ringSize}
            onChange={(e) =>
              setRingSize(e.target.value ? Number(e.target.value) : "")
            }
            className={selectClass}
          >
            <option value="">Sélectionnez votre taille...</option>
            {ringSizes.map((size) => (
              <option key={size} value={size}>
                {size} ({(size / Math.PI).toFixed(1)} mm ø)
              </option>
            ))}
          </select>

          {/* Visual reference */}
          <div className="mt-4 p-4 bg-ivory rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-muted shrink-0 mt-0.5" />
              <div className="text-xs text-muted">
                <p className="font-medium text-foreground mb-1">
                  Comment mesurer ?
                </p>
                <p>
                  Enroulez un fil autour de votre doigt, marquez le point de
                  rencontre et mesurez la longueur en mm. Cette mesure
                  correspond à votre tour de doigt (taille française).
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="3"
                  />
                  <line
                    x1="40"
                    y1="10"
                    x2="40"
                    y2="70"
                    stroke="var(--terracotta)"
                    strokeWidth="1"
                    strokeDasharray="4,2"
                  />
                  <text
                    x="48"
                    y="44"
                    fontSize="8"
                    fill="var(--terracotta)"
                    fontFamily="DM Sans"
                  >
                    ø
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bracelet size */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-beige-nude-light flex items-center justify-center">
              <span className="text-lg">📿</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">
                Taille de bracelet
              </h2>
              <p className="text-xs text-muted">Tour de poignet</p>
            </div>
          </div>

          <div className="space-y-2">
            {braceletSizes.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => setBraceletSize(size.value)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-all",
                  braceletSize === size.value
                    ? "border-terracotta bg-terracotta/5 text-terracotta"
                    : "border-border hover:border-terracotta/30"
                )}
              >
                <span>{size.label}</span>
                {braceletSize === size.value && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 p-4 bg-ivory rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-muted shrink-0 mt-0.5" />
              <div className="text-xs text-muted">
                <p className="font-medium text-foreground mb-1">
                  Comment mesurer ?
                </p>
                <p>
                  Mesurez votre poignet au niveau de l&apos;os avec un mètre
                  ruban souple. Ajoutez 1 à 2 cm pour un confort optimal.
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-3 gap-4">
              {braceletSizes.map((size) => (
                <div
                  key={size.value}
                  className={cn(
                    "text-center transition-all",
                    braceletSize === size.value && "scale-110"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 mx-auto flex items-center justify-center",
                      braceletSize === size.value
                        ? "border-terracotta"
                        : "border-border"
                    )}
                  >
                    <span className="text-[10px] font-bold">{size.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Necklace length */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-xl border border-border p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-beige-nude-light flex items-center justify-center">
              <span className="text-lg">📏</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">
                Longueur de collier préférée
              </h2>
              <p className="text-xs text-muted">
                Choisissez votre longueur habituelle
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {necklaceLengths.map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => setNecklaceLength(length)}
                className={cn(
                  "px-5 py-3 rounded-lg border text-sm font-medium transition-all",
                  necklaceLength === length
                    ? "border-terracotta bg-terracotta/5 text-terracotta"
                    : "border-border hover:border-terracotta/30"
                )}
              >
                {length} cm
              </button>
            ))}
          </div>

          {/* Visual diagram */}
          <div className="mt-6 p-4 bg-ivory rounded-lg">
            <p className="text-xs font-medium text-foreground mb-3">
              Guide des longueurs
            </p>
            <div className="flex justify-center">
              <svg viewBox="0 0 200 180" className="w-full max-w-[280px]">
                {/* Neck/bust silhouette */}
                <path
                  d="M100,30 C60,30 40,50 40,70 L40,180"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                />
                <path
                  d="M100,30 C140,30 160,50 160,70 L160,180"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="100"
                  cy="28"
                  rx="18"
                  ry="8"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                />

                {/* Necklace lines */}
                {[
                  { len: 38, y: 55, color: "var(--terracotta)" },
                  { len: 42, y: 70, color: "var(--gold)" },
                  { len: 45, y: 85, color: "var(--terracotta-light)" },
                  { len: 50, y: 105, color: "var(--gold-light)" },
                  { len: 60, y: 135, color: "var(--muted)" },
                ].map(({ len, y, color }) => (
                  <g key={len}>
                    <ellipse
                      cx="100"
                      cy={y}
                      rx={25 + (y - 55) * 0.3}
                      ry={(y - 25) * 0.15}
                      fill="none"
                      stroke={
                        necklaceLength === len ? "var(--terracotta)" : color
                      }
                      strokeWidth={necklaceLength === len ? 2.5 : 1.5}
                      strokeDasharray={necklaceLength === len ? "none" : "4,3"}
                    />
                    <text
                      x={130 + (y - 55) * 0.3}
                      y={y + 4}
                      fontSize="9"
                      fill={
                        necklaceLength === len
                          ? "var(--terracotta)"
                          : "var(--muted)"
                      }
                      fontWeight={necklaceLength === len ? "600" : "400"}
                      fontFamily="DM Sans"
                    >
                      {len}cm
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-[10px] text-muted">
              <span>38cm — Ras du cou</span>
              <span>42cm — Princesse court</span>
              <span>45cm — Princesse</span>
              <span>50cm — Matinée</span>
              <span>60cm — Opéra</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Actions */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8"
      >
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Tailles enregistrées !" : "Sauvegarder mes tailles"}
        </button>

        <Link
          href="/guide-des-tailles"
          className="flex items-center gap-1.5 text-sm text-terracotta hover:text-terracotta-dark font-medium"
        >
          Consulter le guide des tailles complet
          <ExternalLink className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
