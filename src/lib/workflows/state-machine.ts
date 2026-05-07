/**
 * Helpers de machine d'états pour les workflows admin (Commandes, Retours,
 * Tickets). Chaque workflow définit une carte `from → Set<allowed to>`.
 *
 * `canTransition` répond à la question : est-ce que passer de `from` à `to`
 * est autorisé par le workflow ?
 *
 * Convention : `from === to` est toujours autorisé (no-op idempotent côté
 * appelant — on évite de bloquer un re-clic ou un envoi dupliqué).
 */

export interface TransitionResult {
  ok: boolean;
  error?: string;
}

export function canTransition(
  graph: Readonly<Record<string, ReadonlySet<string>>>,
  from: string,
  to: string,
): boolean {
  if (from === to) return true;
  return graph[from]?.has(to) ?? false;
}

export function validateTransition(
  graph: Readonly<Record<string, ReadonlySet<string>>>,
  from: string,
  to: string,
  workflowLabel: string,
): TransitionResult {
  if (canTransition(graph, from, to)) return { ok: true };
  return {
    ok: false,
    error: `Transition ${workflowLabel} interdite : ${from} → ${to}`,
  };
}
