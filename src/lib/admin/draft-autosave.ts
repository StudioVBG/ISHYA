/**
 * Autosave brouillon (blog + pages CMS) — sauvegarde locale via
 * localStorage à chaque changement (debounce 2s) pour ne JAMAIS perdre
 * une rédaction en cours (crash navigateur, fermeture accidentelle,
 * refresh sans Save).
 *
 * Trois clés possibles :
 *   ishya:draft:blog:<postId>     pour un article existant
 *   ishya:draft:blog:new          pour un nouvel article
 *   ishya:draft:page:<pageId>     pour une page existante
 *   ishya:draft:page:new          pour une nouvelle page
 *
 * Politique :
 * - À l'ouverture du form : si un brouillon plus récent que la dernière
 *   sauvegarde serveur existe, on affiche un bandeau "Restaurer / Ignorer"
 *   (pas de remplacement automatique pour éviter l'effet de surprise).
 * - Pendant la frappe : write debounce 2s.
 * - Après une sauvegarde serveur réussie : on clear la clé.
 *
 * Sécurité : aucune donnée sensible (les brouillons sont du contenu
 * éditorial, pas des secrets). localStorage est isolé par origine.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";

export type AutosaveKind = "blog" | "page";

/**
 * Forme générique d'un brouillon. Le caller stringify lui-même son
 * snapshot (tous les champs du form) — on ne valide pas la structure ici.
 */
export type DraftSnapshot = {
  data: Record<string, unknown>;
  savedAt: number;
};

export function buildDraftKey(kind: AutosaveKind, id: string | null): string {
  return `ishya:draft:${kind}:${id ?? "new"}`;
}

export function writeDraft(key: string, data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const snapshot: DraftSnapshot = { data, savedAt: Date.now() };
    window.localStorage.setItem(key, JSON.stringify(snapshot));
  } catch (err) {
    console.error("[autosave] write", err);
  }
}

export function clearDraft(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error("[autosave] clear", err);
  }
}

/**
 * Hook : sauvegarde automatique 2s après le dernier changement.
 *
 * Le PREMIER snapshot vu (celui au mount, identique à l'état initial du
 * formulaire) n'est PAS écrit — sinon la simple visite d'un article créé
 * un brouillon fantôme. Les écritures suivantes (modifs réelles) sont
 * débounce à `delayMs`.
 *
 * `data` n'a pas besoin d'être stable côté ref : on sérialise et on
 * compare des chaînes.
 */
export function useAutosave(
  key: string,
  data: Record<string, unknown>,
  options: { delayMs?: number; enabled?: boolean } = {},
) {
  const { delayMs = 2000, enabled = true } = options;
  const serialized = JSON.stringify(data);
  const initialSerialized = useRef(serialized);
  useEffect(() => {
    if (!enabled) return;
    if (serialized === initialSerialized.current) return;
    const id = setTimeout(() => {
      try {
        const snapshot: DraftSnapshot = {
          data: JSON.parse(serialized),
          savedAt: Date.now(),
        };
        window.localStorage.setItem(key, JSON.stringify(snapshot));
      } catch (err) {
        console.error("[autosave] write", err);
      }
    }, delayMs);
    return () => clearTimeout(id);
  }, [key, serialized, delayMs, enabled]);
}

// Subscribe to localStorage changes (cross-tab via storage event).
function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * Hook : retourne le brouillon courant en localStorage pour la clé donnée.
 * `null` si aucun brouillon, ou si on est côté serveur.
 */
export function useStoredDraft(key: string): DraftSnapshot | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(key);
    },
    () => null,
  );
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DraftSnapshot;
    if (
      typeof parsed?.savedAt !== "number" ||
      typeof parsed?.data !== "object" ||
      parsed.data === null
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
