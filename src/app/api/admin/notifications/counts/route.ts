import { getAdminNotificationCounts } from "@/lib/queries/admin-notifications";
import { requireAdminRole } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

/**
 * Endpoint de polling pour la cloche de notifications du back-office.
 * Renvoie les compteurs `pendingOrders`, `pendingReturns`, `openTickets`,
 * `unmoderatedReviews` + `total`. Appelé toutes les 60 secondes par
 * `NotificationBell` pour afficher des compteurs vivants sans recharger
 * la page admin.
 *
 * Auth : `requireAdminRole()` — refus 403 si non admin.
 */
export async function GET() {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: 403 });
  }

  const counts = await getAdminNotificationCounts();
  return Response.json(counts, {
    headers: {
      // Pas de cache navigateur — on veut les compteurs fraîchement calculés.
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
