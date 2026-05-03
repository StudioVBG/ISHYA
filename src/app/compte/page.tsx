import {
  getCurrentUserOrders,
  getCurrentUserProfile,
  getCurrentUserStats,
} from "@/lib/queries/account";
import { DashboardView } from "./DashboardView";

export const metadata = {
  title: "Mon compte — ISHYA",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [profile, stats, orders] = await Promise.all([
    getCurrentUserProfile(),
    getCurrentUserStats(),
    getCurrentUserOrders(),
  ]);

  return (
    <DashboardView
      firstName={profile?.firstName ?? null}
      stats={stats}
      recentOrders={orders.slice(0, 3)}
    />
  );
}
