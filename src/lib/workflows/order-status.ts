import { validateTransition, type TransitionResult } from "./state-machine";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "on_hold"
  | "failed";

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "partially_refunded",
  "on_hold",
  "failed",
];

/**
 * Transitions valides côté commande. Les statuts terminaux ne ré-émettent rien.
 * - cancelled, refunded, failed : pas de transition sortante
 *   (la commande est définitivement close ; un nouveau cycle = nouvelle commande)
 *
 * Note : `pending → shipped` est volontairement absent — on ne peut pas
 * expédier sans paiement confirmé. De même `delivered → processing` n'est
 * pas autorisé (pas de retour en arrière sans process retour).
 */
const ORDER_TRANSITIONS: Readonly<Record<OrderStatus, ReadonlySet<OrderStatus>>> = {
  pending: new Set(["confirmed", "failed", "cancelled", "on_hold"]),
  confirmed: new Set([
    "processing",
    "shipped",
    "on_hold",
    "cancelled",
    "refunded",
    "partially_refunded",
  ]),
  processing: new Set([
    "shipped",
    "on_hold",
    "cancelled",
    "refunded",
    "partially_refunded",
  ]),
  shipped: new Set(["delivered", "refunded", "partially_refunded"]),
  delivered: new Set(["refunded", "partially_refunded"]),
  on_hold: new Set(["confirmed", "processing", "cancelled"]),
  partially_refunded: new Set(["refunded"]),
  // Statuts terminaux
  cancelled: new Set(),
  refunded: new Set(),
  failed: new Set(["pending"]),
};

export function validateOrderTransition(
  from: string,
  to: string,
): TransitionResult {
  return validateTransition(
    ORDER_TRANSITIONS as Readonly<Record<string, ReadonlySet<string>>>,
    from,
    to,
    "commande",
  );
}
