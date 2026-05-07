import { validateTransition, type TransitionResult } from "./state-machine";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "shipped_back"
  | "received"
  | "inspected"
  | "refunded"
  | "exchanged"
  | "closed";

export const RETURN_STATUSES: readonly ReturnStatus[] = [
  "requested",
  "approved",
  "rejected",
  "shipped_back",
  "received",
  "inspected",
  "refunded",
  "exchanged",
  "closed",
];

/**
 * Workflow retours : flow linéaire avec quelques branches.
 *
 *   requested ─► approved ─► shipped_back ─► received ─► inspected ─► refunded ─► closed
 *           │                                                       └► exchanged ─► closed
 *           └► rejected ─► closed
 */
const RETURN_TRANSITIONS: Readonly<
  Record<ReturnStatus, ReadonlySet<ReturnStatus>>
> = {
  requested: new Set(["approved", "rejected"]),
  approved: new Set(["shipped_back", "rejected"]),
  shipped_back: new Set(["received"]),
  received: new Set(["inspected"]),
  inspected: new Set(["refunded", "exchanged", "rejected"]),
  refunded: new Set(["closed"]),
  exchanged: new Set(["closed"]),
  rejected: new Set(["closed"]),
  // Statut terminal
  closed: new Set(),
};

export function validateReturnTransition(
  from: string,
  to: string,
): TransitionResult {
  return validateTransition(
    RETURN_TRANSITIONS as Readonly<Record<string, ReadonlySet<string>>>,
    from,
    to,
    "retour",
  );
}
