// Typographie française — règles AFNOR / Imprimerie nationale.
// CSS ne sait pas insérer un caractère entre du texte et de la ponctuation,
// alors on le fait à la rédaction des chaînes :
//   - espace fine insécable (NNBSP, U+202F) avant : ; ! ? %
//   - espace insécable normale (NBSP, U+00A0) entre nombre et unité
//   - guillemets français « ... » avec NNBSP intérieurs
// Idempotent : appliquer deux fois ne double pas les espaces.

const NNBSP = " ";
const NBSP = " ";

const PUNCT_THIN = /(\S)([:;!?%])/g;
const NUMBER_UNIT = /(\d)\s+(€|EUR|cm|mm|kg|g|h|min|j|jours?|semaines?|mois)\b/g;
const ASCII_QUOTES = /"([^"]+)"/g;

export function frTypo(input: string | null | undefined): string {
  if (!input) return "";
  let out = input;

  // Nettoyer d'abord les éventuelles espaces normales déjà présentes avant
  // la ponctuation pour éviter de cumuler.
  out = out.replace(/[   ]+([:;!?%])/g, "$1");

  // Réinsérer un NNBSP avant chaque ponctuation double.
  out = out.replace(PUNCT_THIN, `$1${NNBSP}$2`);

  // Espace insécable entre nombre et unité.
  out = out.replace(NUMBER_UNIT, `$1${NBSP}$2`);

  // Guillemets droits → chevrons français avec NNBSP intérieurs.
  out = out.replace(ASCII_QUOTES, `«${NNBSP}$1${NNBSP}»`);

  return out;
}
