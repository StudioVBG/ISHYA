"use client";

/**
 * Mock du rendu d'un résultat Google. Les couleurs et la typographie sont
 * approximées (Google ajuste régulièrement) — c'est un guide, pas un
 * pixel-perfect.
 *
 * Limites typiques :
 * - Title tronqué à ~580px (~ 60-65 caractères selon les majuscules)
 * - Description tronquée à ~280-320 caractères en desktop
 */

const SITE_URL = "https://ishya.fr";

function truncateTitle(title: string, max = 60): string {
  if (title.length <= max) return title;
  return title.slice(0, max - 1).trimEnd() + "…";
}

function truncateDescription(desc: string, max = 160): string {
  if (desc.length <= max) return desc;
  return desc.slice(0, max - 1).trimEnd() + "…";
}

export function SerpPreview({
  title,
  description,
  pathname = "/",
}: {
  title: string;
  description: string;
  pathname?: string;
}) {
  const displayTitle = title.trim() || "ISHYA — Bijoux Floraux Artisanaux";
  const displayDesc =
    description.trim() ||
    "Bijoux uniques en résine cristalline et fleurs séchées, faits main en France.";
  const url = `${SITE_URL}${pathname}`;
  const isOverTitle = title.length > 60;
  const isOverDesc = description.length > 160;

  return (
    <div className="bg-white rounded-xl border border-border p-5 space-y-3">
      <p className="text-xs font-semibold text-steel uppercase tracking-wider">
        Aperçu Google
      </p>

      <div className="font-sans">
        <div className="flex items-center gap-2 text-xs text-steel">
          <div className="w-5 h-5 rounded-full bg-ember/10 flex items-center justify-center text-[10px] font-bold text-ember">
            I
          </div>
          <div>
            <p className="text-foreground">ishya.fr</p>
            <p className="text-[11px] text-steel-soft truncate max-w-md">
              {url}
            </p>
          </div>
        </div>
        <h3
          className="mt-1.5 text-info hover:underline cursor-pointer"
          style={{ fontSize: "20px", lineHeight: "26px" }}
        >
          {truncateTitle(displayTitle)}
        </h3>
        <p
          className="text-foreground/80 mt-1"
          style={{ fontSize: "14px", lineHeight: "22px" }}
        >
          {truncateDescription(displayDesc)}
        </p>
      </div>

      {(isOverTitle || isOverDesc) && (
        <p className="text-xs text-warning">
          ⚠ {isOverTitle && "Title > 60c (sera tronqué)"}
          {isOverTitle && isOverDesc && " · "}
          {isOverDesc && "Description > 160c (sera tronquée)"}
        </p>
      )}
    </div>
  );
}
