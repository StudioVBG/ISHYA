import { frTypo } from "@/lib/fr-typo";

// Rend un texte en respectant les règles typographiques françaises
// (espaces fines insécables avant les ponctuations doubles, chevrons, etc.).
// À utiliser autour des morceaux de texte sensibles (titres, CTA, paragraphes
// éditoriaux). Ne pas mettre autour de texte déjà nettoyé manuellement.
export function Fr({ children }: { children: string }) {
  return <>{frTypo(children)}</>;
}
