import { validateTransition, type TransitionResult } from "./state-machine";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "waiting_internal"
  | "resolved"
  | "closed";

export const TICKET_STATUSES: readonly TicketStatus[] = [
  "open",
  "in_progress",
  "waiting_customer",
  "waiting_internal",
  "resolved",
  "closed",
];

/**
 * Workflow tickets : graphe relativement libre — un ticket peut basculer
 * entre `in_progress` et les états d'attente (waiting_customer / internal),
 * être résolu, fermé, et même rouvert (`closed → open`, `resolved → open`).
 *
 * Convention : `closed → open` autorisé pour permettre la réouverture suite
 * à une nouvelle réponse client.
 */
const TICKET_TRANSITIONS: Readonly<
  Record<TicketStatus, ReadonlySet<TicketStatus>>
> = {
  open: new Set(["in_progress", "waiting_customer", "waiting_internal", "resolved", "closed"]),
  in_progress: new Set(["waiting_customer", "waiting_internal", "resolved", "closed", "open"]),
  waiting_customer: new Set(["in_progress", "resolved", "closed", "open"]),
  waiting_internal: new Set(["in_progress", "resolved", "closed", "open"]),
  resolved: new Set(["closed", "open"]),
  closed: new Set(["open"]),
};

export function validateTicketTransition(
  from: string,
  to: string,
): TransitionResult {
  return validateTransition(
    TICKET_TRANSITIONS as Readonly<Record<string, ReadonlySet<string>>>,
    from,
    to,
    "ticket",
  );
}
