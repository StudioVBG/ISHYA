"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

/**
 * Mock du rendu d'une carte OpenGraph (Facebook / LinkedIn / Twitter).
 * Le ratio cible est 1.91:1 (1200×630) et la largeur d'affichage typique
 * fait ~500px. Le titre est tronqué à 65-70c, la description à ~125c.
 */

function trunc(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export function OgPreview({
  title,
  description,
  imageUrl,
  domain = "ishya.fr",
}: {
  title: string;
  description: string;
  imageUrl: string | null;
  domain?: string;
}) {
  const displayTitle =
    trunc(title.trim(), 70) || "ISHYA — Bijoux Floraux Artisanaux";
  const displayDesc =
    trunc(description.trim(), 125) ||
    "Bijoux uniques en résine cristalline et fleurs séchées, faits main.";

  return (
    <div className="bg-white rounded-xl border border-border p-5 space-y-3">
      <p className="text-xs font-semibold text-steel uppercase tracking-wider">
        Aperçu carte OpenGraph (Facebook / LinkedIn / Twitter)
      </p>

      <div className="max-w-md border border-border rounded-lg overflow-hidden">
        <div className="relative aspect-[1.91/1] bg-bone-soft">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="500px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-steel-soft">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
        </div>
        <div className="px-4 py-3 bg-bone-soft/30">
          <p className="text-[11px] text-steel-soft uppercase tracking-wide">
            {domain}
          </p>
          <p
            className="font-semibold text-foreground mt-0.5"
            style={{ fontSize: "15px", lineHeight: "20px" }}
          >
            {displayTitle}
          </p>
          {displayDesc && (
            <p
              className="text-steel mt-1"
              style={{ fontSize: "13px", lineHeight: "18px" }}
            >
              {displayDesc}
            </p>
          )}
        </div>
      </div>

      {!imageUrl && (
        <p className="text-xs text-warning">
          ⚠ Sans image OG, le partage social affichera juste le texte. Recommandé : 1200×630 px (≤1 Mo).
        </p>
      )}
    </div>
  );
}
