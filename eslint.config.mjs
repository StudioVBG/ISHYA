import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Tokens ISHYA — palette autorisée
// Toute classe color en dur (bg-emerald-500, text-gray-700, bg-[#fff]…)
// est interdite : utiliser les tokens du design system (foreground, muted,
// terracotta, gold, success, info, warning, destructive, accent-purple…).
// Voir src/app/globals.css et /styleguide.
const FORBIDDEN_TAILWIND_COLORS = [
  // Échelles Tailwind brutes (gray, emerald, red, blue, etc.) avec niveaux
  "(text|bg|border|divide|ring|fill|stroke|from|to|via|placeholder|caret|accent|outline|decoration|shadow|hover:bg|hover:text|hover:border|focus:bg|focus:text|focus:border|focus:ring|peer-checked:bg|peer-focus:ring|group-hover:bg|group-hover:text|group-hover:border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\\b",
  // Couleurs hex en valeurs arbitraires : bg-[#fff], text-[#1a1a1a], etc.
  "(text|bg|border|fill|stroke|from|to|via|ring|outline|shadow|hover:bg|hover:text|hover:border)-\\[#[0-9A-Fa-f]{3,8}\\]",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Garde-fou design system : interdit les classes Tailwind brutes
  // hors des chemins listés ci-dessous (admin/layout dark theme + styleguide
  // qui les cite comme contre-exemples).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/app/admin/layout.tsx",
      // Sidebar admin volontairement en dark theme : utilise gray-* pour la
      // surface foncée. Pas de tokens ISHYA équivalents (le design system
      // est pensé pour le storefront/admin clair).
      "src/app/admin/AdminShell.tsx",
      "src/app/(storefront)/styleguide/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: `Literal[value=/${FORBIDDEN_TAILWIND_COLORS[0]}/]`,
          message:
            "Couleur Tailwind brute interdite. Utilisez un token ISHYA (bg-terracotta, text-foreground, text-muted, bg-success-soft, bg-warning, etc.). Voir /styleguide.",
        },
        {
          selector: `Literal[value=/${FORBIDDEN_TAILWIND_COLORS[1]}/]`,
          message:
            "Couleur hex en dur interdite. Définissez un token CSS dans globals.css ou utilisez un token existant.",
        },
        {
          selector: `TemplateElement[value.raw=/${FORBIDDEN_TAILWIND_COLORS[0]}/]`,
          message:
            "Couleur Tailwind brute interdite (template literal). Utilisez un token ISHYA.",
        },
        {
          selector: `TemplateElement[value.raw=/${FORBIDDEN_TAILWIND_COLORS[1]}/]`,
          message:
            "Couleur hex en dur interdite (template literal). Utilisez un token.",
        },
      ],
    },
  },
]);

export default eslintConfig;
